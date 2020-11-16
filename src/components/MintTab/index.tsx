import React, { useContext, useEffect, useState } from "react"
import { Box, Button, styled, Typography, useTheme } from "@material-ui/core"
import AmountInput from "components/controls/AmountInput"
import ArrowForward from "@material-ui/icons/ArrowForward"
import { getTokenDetails } from "utils"
import { Erc20Token } from "types"
import { useWallet } from "use-wallet"
import ERC20TokenService from "services/ERC20"
import { useSafe } from "@rmeissner/safe-apps-react-sdk"
import { ethers } from "ethers"
import { M_TOKEN_MAP } from "consts"
import useAsyncMemo from "hooks/useAsyncMemo"
import DmmContext from "DmmContext"
import { map } from "lodash"
import DmmTokenService from "services/DMMTokenService"
import Big from "big.js"

const HelperText = styled(Typography)({
  textAlign: "center",
  margin: "30px",
  fontWeight: "lighter",
})

const MintTab = () => {
  const theme = useTheme()
  const wallet = useWallet()
  const safe = useSafe()
  const {
    state: { tokens },
    dispatch,
  } = useContext(DmmContext)

  const [token, setToken] = useState<Erc20Token>("ETH")
  const mToken = M_TOKEN_MAP[token]

  const tokenDetails =
    wallet.chainId === 1 || wallet.chainId === 4
      ? getTokenDetails(wallet.chainId, token)
      : null

  const [amount, setAmount] = useState<string>("0")

  const safeInfo = safe.getSafeInfo()

  const [balance] = useAsyncMemo<string>(
    async () => {
      if (safeInfo) {
        if (tokens[token].balance) {
          return tokens[token].balance
        }

        if (token === "ETH") {
          const balance = ethers.utils
            .parseEther(safeInfo.ethBalance)
            .toString()
          dispatch({ type: "UPDATE_BALANCE", payload: { token, balance } })
          return balance
        } else if (tokenDetails?.address && wallet.account) {
          const balance = (
            await ERC20TokenService.getInstance(
              tokenDetails?.address
            ).balanceOf(safeInfo.safeAddress)
          ).toString()
          dispatch({ type: "UPDATE_BALANCE", payload: { token, balance } })
          return balance
        }
      }
    },
    "0",
    [token, tokenDetails?.address, safeInfo]
  )

  const [exchangeRate] = useAsyncMemo<string>(
    async () => {
      if (tokens?.[token]?.exchangeRate) {
        return tokens[token].exchangeRate
      }

      const exchangeRate = (
        await DmmTokenService.getExchangeRate(tokens[token]["dmmTokenId"])
      ).toString()

      dispatch({
        type: "UPDATE_EXCHANGE_RATE",
        payload: { token, exchangeRate },
      })
      return exchangeRate
    },
    "0",
    [tokens?.[token]]
  )

  const rightAmount =
    exchangeRate !== "0"
      ? new Big(amount || "0")
          .times(`1e${tokens[token].decimals}`)
          .div(exchangeRate as string)
          .toFixed(0)
      : "0"

  useEffect(() => {
    if (wallet.status === "disconnected") {
      wallet.connect("injected")
    }
  }, [wallet])

  const handleTokenChange = (
    e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    e.preventDefault()
    setToken(e.target.value as Erc20Token)
    setAmount("0")
  }

  const handleAmountChange = (value: string = "0") => setAmount(value)

  const handleMaxButtonClick = () => setAmount(balance as string)

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
          tokens={map(tokens, "symbol")}
          selectedToken={token}
          decimals={tokenDetails?.decimals || 0}
          value={amount}
          onTokenChange={handleTokenChange}
          onChange={handleAmountChange}
          onMaxButtonClick={handleMaxButtonClick}
        />
        <ArrowForward
          style={{ margin: "12px", color: theme.palette.text.primary }}
          color="primary"
        />
        <AmountInput
          selectedToken={mToken}
          fixedToken
          decimals={tokenDetails?.decimals || 0}
          value={rightAmount}
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
