import React, { useCallback, useState } from "react"
import { Box, Button, styled, Typography } from "@material-ui/core"
import { Erc20Token, Maybe, MToken } from "types"
import { connect } from "DmmContext"
import { map } from "lodash"
import Big from "big.js"
import Converter from "components/controls/Converter"
import { SafeInfo } from "@gnosis.pm/safe-apps-sdk"
import { changeToken, redeem, reload } from "actions"
import { useActionListener } from "middlewares/observerMiddleware"
import { DmmTokenDetailsType } from "services/DMMTokenService"
import { REVERSE_M_TOKEN_MAP } from "consts"
import NumberUtil from "utils/NumberUtil"

const HelperText = styled(Typography)({
  textAlign: "center",
  margin: "30px",
  fontWeight: "lighter",
})

interface RedeemTabPropsType {
  tokens: Record<Erc20Token, DmmTokenDetailsType>
  selectedToken: Erc20Token
  safeInfo: Maybe<SafeInfo>
  loading: boolean
  balance: string
  exchangeRate: string
  decimals: number
  reload: () => void
  changeToken: (token: Erc20Token) => void
  redeem: (amount: string) => void
}

const RedeemTab = ({
  tokens,
  selectedToken,
  safeInfo,
  loading,
  balance,
  exchangeRate,
  decimals,
  reload,
  changeToken,
  redeem,
}: RedeemTabPropsType) => {
  const [amount, setAmount] = useState<string>("0")

  const resetAmount = useCallback(() => setAmount("0"), [])

  useActionListener(["SAFE_TRANSACTION_CONFIRMED"], resetAmount)

  const exchangeRateBig = new Big(1)
    .times(NumberUtil._1)
    .div(exchangeRate || "1")

  const insufficientBalance =
    balance !== "" && new Big(amount || 0).gt(balance as string)

  const belowMinimum =
    amount !== "" &&
    amount !== "0" &&
    new Big(amount || 0).lt(new Big(`1e${decimals || 0}`))

  const token = selectedToken && tokens[selectedToken]
  const tokenPair = token
    ? [tokens[selectedToken].dmmTokenSymbol, tokens[selectedToken].symbol]
    : []

  const handleTokenChange = (
    e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    e.preventDefault()
    setAmount("")
    changeToken(REVERSE_M_TOKEN_MAP[e.target.value as MToken])
  }

  const handleLeftAmountChange = (value: string = "0") => setAmount(value)

  const handleMaxButtonClick = () => setAmount((balance as string) || "0")

  const handleButtonClick = () => redeem(amount)

  return (
    <Box>
      <HelperText
        align="center"
        display="block"
        variant="body2"
        color="textPrimary"
      >
        Redeem your mTokens back to tokens with interest.
      </HelperText>
      <Converter
        tokens={map(tokens, "dmmTokenSymbol").filter((t) => !!t)}
        tokenPair={tokenPair}
        decimals={token?.decimals || 0}
        leftValue={amount}
        exchangeRate={exchangeRateBig}
        onTokenChange={handleTokenChange}
        onAmountChange={({ left }) => handleLeftAmountChange(left)}
        onMaxButtonClick={handleMaxButtonClick}
      />
      <Typography color="error" variant="subtitle2" style={{ height: 21 }}>
        {(!!belowMinimum && "Must be >= 1") ||
          (!!insufficientBalance && "Insufficient balance")}
      </Typography>
      <Button
        color="primary"
        variant="contained"
        style={{ float: "right", marginTop: "20px" }}
        disabled={insufficientBalance || belowMinimum || loading}
        onClick={handleButtonClick}
      >
        Redeem
      </Button>
    </Box>
  )
}

export default connect<RedeemTabPropsType>(
  ({ tokens, selectedToken, safeInfo, loading }) => ({
    tokens,
    selectedToken,
    safeInfo,
    loading,
    balance: tokens?.[selectedToken]?.dmmBalance || "",
    exchangeRate: tokens?.[selectedToken]?.exchangeRate || "",
    decimals: tokens?.[selectedToken]?.decimals || 18,
  }),
  (dispatch, { selectedToken: token }) => ({
    reload: () => dispatch(reload()),
    changeToken: (newToken: Erc20Token) => dispatch(changeToken(newToken)),
    redeem: (amount: string) => dispatch(redeem(token, amount)),
  })
)(RedeemTab)
