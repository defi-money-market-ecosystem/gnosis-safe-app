import React from "react"
import { Box, useTheme } from "@material-ui/core"
import AmountInput from "components/controls/AmountInput"
import ArrowForward from "@material-ui/icons/ArrowForward"
import Big from "big.js"
import NumberUtil from "utils/NumberUtil"
import { TokenDetailsType } from "consts"

interface ConverterPropsType {
  tokens: Array<string>
  leftToken: TokenDetailsType
  leftValue: string
  rightToken: string
  exchangeRate: string
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
    leftToken,
    leftValue,
    rightToken,
    exchangeRate,
    onTokenChange,
    onAmountChange,
    onMaxButtonClick,
  } = props

  const rightAmount =
    exchangeRate !== "" && exchangeRate !== "0" && leftValue !== ""
      ? new Big(leftValue || "0")
          .times(NumberUtil._1)
          .div(exchangeRate as string)
          .toFixed(0)
      : ""

  const handleLeftAmountChange = (value: string = "0") => {
    const right =
      exchangeRate !== "" && exchangeRate !== "0" && value !== ""
        ? new Big(value || "0")
            .times(NumberUtil._1)
            .div(exchangeRate as string)
            .toFixed(0)
        : ""
    onAmountChange({ left: value, right })
  }

  const handleRightAmountChange = (value: string) => {
    if (value === rightAmount) {
      return
    }

    const left =
      exchangeRate !== "" && exchangeRate !== "0" && value !== ""
        ? new Big(value)
            .div(NumberUtil._1)
            .times(exchangeRate as string)
            .toFixed(0)
        : ""

    onAmountChange({ left, right: value })
  }

  return (
    <Box display="flex" alignItems="flex-end">
      <AmountInput
        tokens={tokens}
        selectedToken={leftToken?.symbol || "ETH"}
        decimals={leftToken?.decimals || 0}
        value={leftValue}
        onTokenChange={onTokenChange}
        onChange={handleLeftAmountChange}
        onMaxButtonClick={onMaxButtonClick}
        fixedToken={!tokens.length}
        disabled={!tokens.length || !leftToken?.symbol}
      />
      <ArrowForward
        style={{ margin: "12px", color: theme.palette.text.primary }}
        color="primary"
      />
      <AmountInput
        selectedToken={rightToken}
        fixedToken
        decimals={leftToken?.decimals || 0}
        value={rightAmount}
        onChange={handleRightAmountChange}
        disabled={!tokens.length || !leftToken?.symbol}
      />
    </Box>
  )
}

export default Converter
