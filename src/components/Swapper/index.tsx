import React, { useCallback, useState } from "react"
import { Box, Button, styled, Typography } from "@material-ui/core"
import { Erc20Token, Maybe, MToken } from "types"
import Big from "big.js"
import Converter from "components/controls/Converter"
import { SafeInfo } from "@gnosis.pm/safe-apps-sdk"
import { useActionListener } from "middlewares/observerMiddleware"
import { DmmTokenDetailsType } from "services/DMMTokenService"

const HelperText = styled(Typography)({
  textAlign: "center",
  margin: "30px",
  fontWeight: "lighter",
})

export interface SwapPropsType {
  tokenKeys: Array<Erc20Token> | Array<MToken>
  tokens: Record<Erc20Token, DmmTokenDetailsType>
  tokenPair: Array<Erc20Token | MToken>
  selectedToken: Erc20Token
  safeInfo: Maybe<SafeInfo>
  loading: boolean
  balance: string
  exchangeRateBig: Big
  decimals: number
  reload: () => void
  changeToken: (token: string) => void
  action: (amount: string) => void
  description: string
  actionLabel: string
}

const Swap = ({
  tokenKeys,
  tokens,
  tokenPair,
  selectedToken,
  safeInfo,
  loading,
  balance,
  exchangeRateBig,
  decimals,
  reload,
  changeToken,
  action,
  description,
  actionLabel,
}: SwapPropsType) => {
  const [amount, setAmount] = useState<string>("0")

  const resetAmount = useCallback(() => setAmount("0"), [])

  useActionListener(["SAFE_TRANSACTION_CONFIRMED"], resetAmount)

  const token = selectedToken && tokens[selectedToken]

  const zeroAmount = amount === "" || amount === "0"

  const insufficientBalance =
    !zeroAmount && new Big(amount || 0).gt(balance as string)

  const belowMinimum =
    !zeroAmount && new Big(amount || 0).lt(new Big(`1e${decimals || 0}`))

  const handleTokenChange = (
    e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    e.preventDefault()
    setAmount("")
    changeToken(e.target.value as string)
  }

  const handleLeftAmountChange = (value: string = "0") => setAmount(value)

  const handleMaxButtonClick = () => setAmount((balance as string) || "0")

  const handleButtonClick = () => action(amount)

  return (
    <Box>
      <HelperText
        align="center"
        display="block"
        variant="body2"
        color="textPrimary"
      >
        {description}
      </HelperText>
      <Converter
        tokens={tokenKeys}
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
        disabled={zeroAmount || insufficientBalance || belowMinimum || loading}
        onClick={handleButtonClick}
      >
        {actionLabel}
      </Button>
    </Box>
  )
}

export default Swap
