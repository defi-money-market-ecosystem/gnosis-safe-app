import React from "react"
import { Box, Hidden, makeStyles, Theme } from "@material-ui/core"
import AmountInput from "components/controls/AmountInput"
import ArrowForward from "@material-ui/icons/ArrowForward"
import Big from "big.js"
import { convert } from "utils"
import { ArrowDownward } from "@material-ui/icons"

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

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    [theme.breakpoints.up("sm")]: {
      display: "flex",
      justifyContent: "stretch",
      alignItems: "flex-end",
    },
    overflow: "hidden",
  },
  input: {
    flexGrow: 1,
  },
  arrow: {
    display: "block",
    margin: `${theme.spacing(24)}px auto`,
    padding: `0 ${theme.spacing(24)}px`,
    color: theme.palette.text.primary,
  },
}))

const Converter = (props: ConverterPropsType) => {
  const classes = useStyles()

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

  const rightAmount = convert(leftValue, exchangeRate, decimals).toFixed()

  const handleLeftAmountChange = (value: string = "0") =>
    onAmountChange({
      left: value,
      right: convert(value, exchangeRate, decimals).toFixed(),
    })

  const handleRightAmountChange = (value: string) => {
    if (value === rightAmount) {
      return
    }

    onAmountChange({
      left: convert(value, exchangeRate, decimals, true).toFixed(),
      right: value,
    })
  }

  return (
    <Box className={classes.root}>
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
        className={classes.input}
      />
      <Hidden xsDown>
        <ArrowForward className={classes.arrow} />
      </Hidden>
      <Hidden smUp>
        <ArrowDownward className={classes.arrow} color="primary" />
      </Hidden>
      <AmountInput
        selectedToken={tokenPair[1]}
        fixedToken
        decimals={decimals || 0}
        value={rightAmount}
        onChange={handleRightAmountChange}
        disabled={!tokens.length || !tokenPair?.[1]}
        className={classes.input}
      />
    </Box>
  )
}

export default Converter
