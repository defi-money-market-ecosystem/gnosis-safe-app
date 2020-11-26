import React from "react"
import { Box, Typography } from "@material-ui/core"
import { Erc20Token, MToken } from "types"
import { connect } from "DmmContext"
import Panel from "components/Panel"
import Big from "big.js"
import { formatNumber } from "utils"
import NumberUtil from "utils/NumberUtil"
import styled from "styled-components"
import StyledTabs, { StyledTab } from "components/Tabs"

const TokenLine = styled.div`
  width: 100%;
  border-bottom: 1px solid #e2e2e2;
  display: flex;
  justify-content: space-between;
  padding-bottom: 6px;
  margin-bottom: 6px;
`

const DmmTokenLine = styled.div`
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
}

const BalancesPanel = ({ balances }: BalancesPanelPropsType) => {
  return (
    <Panel>
      <StyledTabs value={0} indicatorSize={50} textColor="primary">
        <StyledTab label="Balances" />
      </StyledTabs>
      <Typography component="div" variant="body1" color="textPrimary">
        <Box m={40} fontWeight={100}>
          {balances.map(
            ({ token, dmmToken, balance, dmmBalance, convertedDmmBalance }) => {
              return (
                <div key={token}>
                  <TokenLine>
                    <span>{token}</span>
                    <Typography>{formatNumber(balance || 0, 0, 8)}</Typography>
                  </TokenLine>
                  <DmmTokenLine>
                    <span>{dmmToken}</span>
                    <div>
                      <span>{formatNumber(dmmBalance || 0, 0, 8)}</span>{" "}
                      <Typography component="span" color="textSecondary">
                        ({formatNumber(convertedDmmBalance || 0, 0, 8)} {token})
                      </Typography>
                    </div>
                  </DmmTokenLine>
                </div>
              )
            }
          )}
        </Box>
      </Typography>
    </Panel>
  )
}

export default connect<BalancesPanelPropsType>(({ tokens }) => ({
  balances: Object.keys(tokens)
    .sort()
    .map((key) => {
      const {
        dmmTokenSymbol = `m${key}`,
        balance = "0.00",
        dmmBalance = "0.00",
        decimals = 0,
        exchangeRate = 0,
      } = tokens[key as Erc20Token] || {}

      return {
        token: key,
        dmmToken: dmmTokenSymbol,
        balance: new Big(balance || 0).times(`1e-${decimals}`).toFixed(),
        dmmBalance,
        convertedDmmBalance: new Big(dmmBalance || 0)
          .times(exchangeRate || 1)
          .div(NumberUtil._1)
          .toFixed(),
      }
    }),
}))(BalancesPanel)
