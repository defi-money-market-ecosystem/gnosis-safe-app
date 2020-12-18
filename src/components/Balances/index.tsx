import React from "react"
import { Box, CircularProgress, Typography } from "@material-ui/core"
import { Erc20Token, MToken } from "types"
import { connect } from "DmmContext"
import Panel from "components/Panel"
import Big from "big.js"
import { formatNumber } from "utils"
import NumberUtil from "utils/NumberUtil"
import styled from "styled-components"
import StyledTabs, { StyledTab } from "components/Tabs"
import { interestPerSecond } from "consts"

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
            ({ token, dmmToken, balance, dmmBalance, convertedDmmBalance }) => {
              return (
                <div key={token}>
                  <UpperLine>
                    <span>{token}</span>
                    <Typography>{formatNumber(balance || 0, 0, 8)}</Typography>
                  </UpperLine>
                  <LowerLine>
                    <span>{dmmToken}</span>
                    <div>
                      <Typography component="span">
                        {formatNumber(dmmBalance || 0, 0, 8)}
                      </Typography>{" "}
                      <Typography component="span" color="textSecondary">
                        ({formatNumber(convertedDmmBalance || 0, 0, 8)} {token})
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
                ${formatNumber(totalAvailableUsd || 0, 0, 2)}
              </Typography>
            </UpperLine>
            <UpperLine>
              <span>Total deposited (USD)</span>
              <Typography>
                ${formatNumber(totalDepositedUsd || 0, 0, 2)}
              </Typography>
            </UpperLine>
            <LowerLine>
              <span>Daily interest (USD)</span>
              <Typography>${formatNumber(dailyInterest || 0, 0, 2)}</Typography>
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

      return {
        token: key,
        dmmToken: dmmTokenSymbol,
        balance: new Big(balance || 0).times(`1e-${decimals}`).toFixed(),
        dmmBalance: bigDmmBalance.toFixed(),
        convertedDmmBalance: bigDmmBalance
          .times(exchangeRate || 1)
          .div(NumberUtil._1)
          .toFixed(),
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
