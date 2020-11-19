import React, { useCallback, useState } from "react"
import { Box, Button, styled, Typography } from "@material-ui/core"
import { Erc20Token, Maybe } from "types"
import { M_TOKEN_MAP, TokenDetailsType } from "consts"
import { connect } from "DmmContext"
import { map } from "lodash"
import Big from "big.js"
import Converter from "components/controls/Converter"
import { SafeInfo } from "@gnosis.pm/safe-apps-sdk"
import { changeToken, mint, reload } from "actions"
import { useActionListener } from "middlewares/observerMiddleware"

const HelperText = styled(Typography)({
  textAlign: "center",
  margin: "30px",
  fontWeight: "lighter",
})

interface MintTabPropsType {
  tokens: Record<Erc20Token, TokenDetailsType>
  selectedToken: Erc20Token
  safeInfo: Maybe<SafeInfo>
  loading: boolean
  balance: string
  exchangeRate: string
  decimals: number
  reload: () => void
  changeToken: (token: Erc20Token) => void
  mint: (amount: string) => void
}

const MintTab = ({
  tokens,
  selectedToken,
  safeInfo,
  loading,
  balance,
  exchangeRate,
  decimals,
  reload,
  changeToken,
  mint,
}: MintTabPropsType) => {
  const mToken = M_TOKEN_MAP[selectedToken]

  const [amount, setAmount] = useState<string>("0")

  const resetAmount = useCallback(() => setAmount("0"), [])

  useActionListener(["SAFE_TRANSACTION_CONFIRMED"], resetAmount)

  const insufficientBalance =
    balance !== "" && new Big(amount || 0).gt(balance as string)

  const belowMinimum =
    amount !== "" &&
    amount !== "0" &&
    new Big(amount || 0).lt(new Big(`1e${decimals || 0}`))

  const handleTokenChange = (
    e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    e.preventDefault()
    setAmount("")
    changeToken(e.target.value as Erc20Token)
  }

  const handleLeftAmountChange = (value: string = "0") => setAmount(value)

  const handleMaxButtonClick = () => setAmount((balance as string) || "0")

  const handleButtonClick = () => mint(amount)

  return (
    <Box>
      <HelperText
        align="center"
        display="block"
        variant="body2"
        color="textPrimary"
      >
        Mint your tokens into mTokens so it can earn interest.
      </HelperText>
      <Converter
        tokens={map(tokens, "symbol").filter((t) => !!t)}
        leftToken={tokens[selectedToken]}
        rightToken={mToken}
        leftValue={amount}
        exchangeRate={exchangeRate as string}
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
        Mint
      </Button>
    </Box>
  )
}

export default connect<MintTabPropsType>(
  ({ tokens, selectedToken, safeInfo, loading }) => ({
    tokens,
    selectedToken,
    safeInfo,
    loading,
    balance: tokens?.[selectedToken]?.balance || "",
    exchangeRate: tokens?.[selectedToken]?.exchangeRate || "",
    decimals: tokens?.[selectedToken]?.decimals || 18,
  }),
  (dispatch, { selectedToken: token }) => ({
    reload: () => dispatch(reload()),
    changeToken: (newToken: Erc20Token) => dispatch(changeToken(newToken)),
    mint: (amount: string) => dispatch(mint(token, amount)),
  })
)(MintTab)
