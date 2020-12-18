import React from "react"
import { Box, useTheme } from "@material-ui/core"
import AmountInput from "components/controls/AmountInput"
import ArrowForward from "@material-ui/icons/ArrowForward"
import Big, { BigSource } from "big.js"
import { DECIMAL_PLACES } from "consts"

const convert = (
  amount: BigSource = 0,
  exchangeRate: BigSource = 1,
  decimals: number = 0,
  reverse = false
) =>
  new Big(amount || 0)
    [reverse ? "times" : "div"](exchangeRate)
    .round(-Math.abs(DECIMAL_PLACES - decimals), reverse ? 3 : 0)
    .toFixed()

interface ConverterPropsType {
  tokens: Array<string>
  tokenPair: Array<string>
  leftValue: string
  decimals: number
  exchangeRate: Big
  onTokenChange: (
    e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => void
  onAmountChange: ({ left, right }: { left: string; right: string }) => void
  onMaxButtonClick: () => void
}

const Converter = (props: ConverterPropsType) => {
  const theme = useTheme()

  const {
    tokens,
    tokenPair = ["ETH", "mETH"],
    decimals = 18,
    leftValue,
    exchangeRate,
    onTokenChange,
    onAmountChange,
    onMaxButtonClick,
  } = props

  const rightAmount = convert(leftValue, exchangeRate, decimals)

  const handleLeftAmountChange = (value: string = "0") =>
    onAmountChange({
      left: value,
      right: convert(value, exchangeRate, decimals),
    })

  const handleRightAmountChange = (value: string) => {
    if (value === rightAmount) {
      return
    }

    onAmountChange({
      left: convert(value, exchangeRate, decimals, true),
      right: value,
    })
  }

  return (
    <Box display="flex" alignItems="flex-end">
      <AmountInput
        tokens={tokens}
        selectedToken={tokenPair?.[0] || "ETH"}
        decimals={decimals || 0}
        value={leftValue}
        onTokenChange={onTokenChange}
        onChange={handleLeftAmountChange}
        onMaxButtonClick={onMaxButtonClick}
        fixedToken={!tokens.length}
        disabled={!tokens.length || !tokenPair?.[0]}
      />
      <ArrowForward
        style={{ margin: "12px", color: theme.palette.text.primary }}
        color="primary"
      />
      <AmountInput
        selectedToken={tokenPair[1]}
        fixedToken
        decimals={decimals || 0}
        value={rightAmount}
        onChange={handleRightAmountChange}
        disabled={!tokens.length || !tokenPair?.[1]}
      />
    </Box>
  )
}

export default Converter
