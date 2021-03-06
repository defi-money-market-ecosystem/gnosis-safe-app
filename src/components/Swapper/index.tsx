import React, { useCallback, useState } from "react"
import { Box, Button, styled, Typography } from "@material-ui/core"
import { Erc20Token, Maybe, MToken } from "types"
import Big, { BigSource } from "big.js"
import Converter from "components/controls/Converter"
import { SafeInfo } from "@gnosis.pm/safe-apps-sdk"
import { useActionListener } from "middlewares/observerMiddleware"
import { DmmTokenDetailsType } from "services/DMMTokenService"
import { DECIMAL_PLACES } from "consts"

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
  minAmount: BigSource
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
  minAmount = 0,
  reload,
  changeToken,
  action,
  description,
  actionLabel,
}: SwapPropsType) => {
  const [amount, setAmount] = useState<string>("0")

  const resetAmount = useCallback(() => setAmount("0"), [])

  useActionListener(["SAFE_TRANSACTION_CONFIRMED"], resetAmount)

  const bigAmount = new Big(amount || 0)

  const token = selectedToken && tokens[selectedToken]

  const zeroAmount = bigAmount.eq(0)

  const insufficientBalance = !zeroAmount && bigAmount.gt(balance as string)

  const belowMinimum = !zeroAmount && bigAmount.lt(minAmount)

  const maxDecimals = Math.min(decimals, DECIMAL_PLACES)

  const extraDecimals =
    bigAmount
      .times(`1e-${decimals || 0}`)
      .toNumber()
      .countDecimals() > maxDecimals

  const handleTokenChange = (
    e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    e.preventDefault()
    setAmount("0")
    changeToken(e.target.value as string)
  }

  const handleLeftAmountChange = (value: string = "0") => setAmount(value)

  const handleMaxButtonClick = () =>
    setAmount(new Big(balance || 0).round(maxDecimals - decimals, 0).toString())

  const handleButtonClick = () => action(amount)

  return (
    <Box overflow="hidden">
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
          (!!insufficientBalance && "Insufficient balance") ||
          (!!extraDecimals && `Must only have up to ${maxDecimals} decimals`)}
      </Typography>
      <Button
        color="primary"
        variant="contained"
        style={{ float: "right" }}
        disabled={
          zeroAmount || insufficientBalance || belowMinimum || extraDecimals
        }
        onClick={handleButtonClick}
      >
        {actionLabel}
      </Button>
    </Box>
  )
}

export default Swap
