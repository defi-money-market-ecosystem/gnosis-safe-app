import React from "react"
import { Box, useTheme } from "@material-ui/core"
import AmountInput from "components/controls/AmountInput"
import ArrowForward from "@material-ui/icons/ArrowForward"
import Big from "big.js"

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

  const rightAmount =
    !exchangeRate.eq(0) && leftValue !== ""
      ? new Big(leftValue || "0").div(exchangeRate).toFixed(0)
      : ""

  const handleLeftAmountChange = (value: string = "0") => {
    const right =
      !exchangeRate.eq(0) && value !== ""
        ? new Big(value || "0").div(exchangeRate).toFixed(0)
        : ""
    onAmountChange({ left: value, right })
  }

  const handleRightAmountChange = (value: string) => {
    if (value === rightAmount) {
      return
    }

    const left =
      !exchangeRate.eq(0) && value !== ""
        ? new Big(value).times(exchangeRate).toFixed(0)
        : ""

    onAmountChange({ left, right: value })
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
