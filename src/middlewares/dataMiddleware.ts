import { CHAIN_ID } from 'consts'
import { transactionFailed } from "./../actions/index"
import { Erc20Token } from "types"
import Contract from "services/Contract"
import DmmToken from "abi/DmmToken.json"
import DmmEther from "abi/DmmEther.json"
import DmmTokenService from "services/DMMTokenService"
import { repeatUntil } from "utils"
import { Dispatch } from "react"
import { Action } from "DmmContext"
import gnosisSafeSdk from "gnosisSafeSdk"
import { ethers } from "ethers"
import ERC20TokenService from "services/ERC20TokenService"
import { SafeInfo } from "@gnosis.pm/safe-apps-sdk"
import { reload, transactionConfirmed } from "actions"

const loadTokens = async (safeInfo: SafeInfo) => {
  const tokens = await DmmTokenService.getDmmTokens(
    CHAIN_ID
  )

  for (const key in tokens) {
    const token = tokens[key as Erc20Token]

    const balance =
      token.symbol === "ETH"
        ? ethers.utils.parseEther(safeInfo.ethBalance).toString()
        : await (await ERC20TokenService.getInstance(token.address)).balanceOf(
            safeInfo.safeAddress
          )

    const exchangeRate = await DmmTokenService.getExchangeRate(token.dmmTokenId)
    tokens[key as Erc20Token] = { ...token, balance, exchangeRate }
  }

  return tokens
}

const dataMiddleware = (store: any) => (next: Dispatch<Action>) => (
  action: Action
) => {
  switch (action.type) {
    case "SAFE_INFO_RECEIVED": {
      loadTokens(action.payload.safeInfo).then((tokens) =>
        store.dispatch({ type: "SET_TOKENS", payload: { tokens } })
      )
      const { wallet } = store.getState()

      if (wallet.status === "disconnected") {
        wallet.connect("injected").then(() => {
          store.dispatch({ type: "SET_WALLET", payload: { wallet } })
        })
      }

      break
    }
    case "SAFE_TRANSACTION_CONFIRMED": {
      const { safeInfo } = store.getState()

      repeatUntil(
        async () =>
          await gnosisSafeSdk.txs.getBySafeTxHash(action.payload.safeTxHash),
        (tx: any) => !!tx.transactionHash,
        5000
      )
        .then((tx: any) => {
          ethers
            .getDefaultProvider(safeInfo.network)
            .waitForTransaction(tx.transactionHash)
            .then((tx) => store.dispatch(transactionConfirmed(tx)))
            .catch((reason) => store.dispatch(transactionFailed(reason)))
        })
        .finally(() => store.dispatch(reload()))
      break
    }
    case "RELOAD": {
      const {safeInfo} = store.getState()
      loadTokens(safeInfo).then((tokens) =>
        store.dispatch({ type: "SET_TOKENS", payload: { tokens } })
      )
      break
    }
    case "MINT": {
      const { tokens } = store.getState()
      const { token, amount } = action.payload
      const isEth = token === "ETH"
      const abi = isEth ? DmmEther : DmmToken

      Contract.getInstance(tokens[token].dmmTokenAddress, abi).then(
        (instance) => {
          gnosisSafeSdk.sendTransactions([
            {
              to: tokens[token].dmmTokenAddress,
              value: isEth ? amount : 0,
              data: instance.contract.interface.encodeFunctionData(
                isEth ? "mintViaEther" : "mint",
                isEth ? undefined : [amount]
              ),
            },
          ])
        }
      )

      break
    }
  }
  next(action)
}

export default dataMiddleware
