import React from "react"
import { Box, CircularProgress, Typography } from "@material-ui/core"
import { Erc20Token, MToken } from "types"
import { connect } from "DmmContext"
import Panel from "components/Panel"
import Big from "big.js"
import { convert, formatNumber } from "utils"
import NumberUtil from "utils/NumberUtil"
import styled from "styled-components"
import StyledTabs, { StyledTab } from "components/Tabs"
import { DECIMAL_PLACES, interestPerSecond } from "consts"

const UpperLine = styled.div`
  width: 100%;
  border-bottom: 1px solid #e2e2e2;
  display: flex;
  justify-content: space-between;
  padding-bottom: 6px;
  margin-bottom: 6px;
`

const LowerLine = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding-bottom: 6px;
  margin-bottom: 6px;
`
interface Balance {
  token: Erc20Token
  accuracy: number
  dmmToken: MToken
  balance: string
  dmmBalance: string
  convertedDmmBalance: string
}
interface BalancesPanelPropsType {
  balances: Array<Balance>
  totalAvailableUsd: string
  totalDepositedUsd: string
  dailyInterest: string
  loading: boolean
}

const BalancesPanel = ({
  balances,
  totalAvailableUsd,
  totalDepositedUsd,
  dailyInterest,
  loading,
}: BalancesPanelPropsType) => {
  return (
    <Panel>
      <StyledTabs value={0} indicatorSize={50} textColor="primary">
        <StyledTab
          label={
            <div>Balances {loading && <CircularProgress size={20} />}</div>
          }
          disabled
        />
      </StyledTabs>
      <Typography component="div" variant="body1" color="textPrimary">
        <Box m={40} fontWeight={100}>
          {balances.map(
            ({
              token,
              accuracy,
              dmmToken,
              balance,
              dmmBalance,
              convertedDmmBalance,
            }) => {
              return (
                <div key={token}>
                  <UpperLine>
                    <span>{token}</span>
                    <Typography>
                      {formatNumber(balance || 0, 0, accuracy)}
                    </Typography>
                  </UpperLine>
                  <LowerLine>
                    <span>{dmmToken}</span>
                    <div>
                      <Typography component="span">
                        {formatNumber(dmmBalance || 0, 0, accuracy)}
                      </Typography>{" "}
                      <Typography component="span" color="textSecondary">
                        ({formatNumber(convertedDmmBalance || 0, 0, accuracy)}{" "}
                        {token})
                      </Typography>
                    </div>
                  </LowerLine>
                </div>
              )
            }
          )}
          <div>
            <UpperLine>
              <span>Total available (USD)</span>
              <Typography>
                ${formatNumber(totalAvailableUsd || 0, 0, 2, 2)}
              </Typography>
            </UpperLine>
            <UpperLine>
              <span>Total deposited (USD)</span>
              <Typography>
                ${formatNumber(totalDepositedUsd || 0, 0, 2, 2)}
              </Typography>
            </UpperLine>
            <LowerLine>
              <span>Daily interest (USD)</span>
              <Typography>
                ${formatNumber(dailyInterest || 0, 0, 2, 2)}
              </Typography>
            </LowerLine>
          </div>
        </Box>
      </Typography>
    </Panel>
  )
}

export default connect<BalancesPanelPropsType>(
  ({ tokens, ethPrice, loading }) => {
    const keys = Object.keys(tokens).sort()
    const balances = keys.map((key) => {
      const {
        dmmTokenSymbol = `m${key}`,
        balance = "0.00",
        dmmBalance = "0.00",
        decimals = 0,
        exchangeRate = 0,
      } = tokens[key as Erc20Token] || {}

      const bigDmmBalance = new Big(dmmBalance || 0).times(`1e-${decimals}`)

      const roundTo = DECIMAL_PLACES < decimals ? DECIMAL_PLACES - decimals : 0

      const convertedDmmBalance = convert(
        new Big(dmmBalance).round(roundTo, 0),
        new Big(NumberUtil._1).div(exchangeRate || 1),
        decimals
      )
        .times(`1e-${decimals}`)
        .toFixed()

      return {
        token: key,
        accuracy: Math.min(decimals, 8),
        dmmToken: dmmTokenSymbol,
        balance: new Big(balance || 0).times(`1e-${decimals}`).toFixed(),
        dmmBalance: bigDmmBalance.toFixed(),
        convertedDmmBalance,
      }
    })

    const [totalAvailableUsd, totalDepositedUsd] = balances.reduce(
      (acc, { token: key, balance, convertedDmmBalance }) => {
        const amountTokens =
          key === "ETH"
            ? new Big(balance || 0)
                .times(ethPrice || 1)
                .times(`1e-8`)
                .toString()
            : balance
        const amountMTokens =
          key === "ETH"
            ? new Big(convertedDmmBalance || 0)
                .times(ethPrice || 1)
                .times(`1e-8`)
                .toString()
            : convertedDmmBalance
        return [acc[0].plus(amountTokens), acc[1].plus(amountMTokens)]
      },
      [new Big(0), new Big(0)]
    )

    const dailyInterest = new Big(totalDepositedUsd)
      .times(interestPerSecond)
      .times(24 * 60 * 60)
      .toFixed()

    return {
      balances,
      totalAvailableUsd: totalAvailableUsd.toFixed(),
      totalDepositedUsd: totalDepositedUsd.toFixed(),
      dailyInterest,
      loading,
    }
  }
)(BalancesPanel)
