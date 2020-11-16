import React, { useState } from "react"
import { Box, Button, styled, Typography, useTheme } from "@material-ui/core"
import AmountInput from "../Controls/AmountInput"
import ArrowForward from "@material-ui/icons/ArrowForward"

type AllowedToken = "ETH" | "DAI" | "USDC" | "USDT"
type MToken = "mETH" | "mDAI" | "mUSDC" | "mUSDT"

const mTokenMap: Record<AllowedToken, MToken> = {
  ETH: "mETH",
  DAI: "mDAI",
  USDC: "mUSDC",
  USDT: "mUSDT",
}

const HelperText = styled(Typography)({
  textAlign: "center",
  margin: "30px",
  fontWeight: "lighter",
})

const MintTab = () => {
  const theme = useTheme()
  const [token, setToken] = useState<AllowedToken>("ETH")
  const [amount, setAmount] = useState<string>("0")
  const mToken = mTokenMap[token]

  const handleTokenChange = (
    e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    e.preventDefault()
    setToken(e.target.value as AllowedToken)
    setAmount("0")
  }

  const handleAmountChange = (value: string) => setAmount(value)

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
      <Box display="flex" alignItems="flex-end">
        <AmountInput
          selectedToken={token}
          decimals={0}
          value={amount}
          onTokenChange={handleTokenChange}
          onChange={handleAmountChange}
          onMaxButtonClick={(e) => {
            // @TODO: Set amount to max
          }}
        />
        <ArrowForward
          style={{ margin: "12px", color: theme.palette.text.primary }}
          color="primary"
        />
        <AmountInput
          selectedToken={mToken}
          fixedToken
          decimals={0}
          value="0"
          onChange={(e: any) => {}}
        />
      </Box>
      <Button
        color="primary"
        variant="contained"
        style={{ float: "right", marginTop: "20px" }}
      >
        Mint
      </Button>
    </Box>
  )
}

export default MintTab
