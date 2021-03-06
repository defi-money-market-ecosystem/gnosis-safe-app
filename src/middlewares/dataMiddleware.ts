import { setTokens } from "./../actions/index"
import { CHAIN_ID_MAP } from "consts"
import { Erc20Token } from "types"
import Contract from "services/Contract"
import DmmToken from "abi/DmmToken.json"
import DmmEther from "abi/DmmEther.json"
import DmmTokenService from "services/DMMTokenService"
import { repeatUntil } from "utils"
import { Dispatch } from "react"
import { Action } from "DmmContext"
import gnosisSafeSdk from "gnosisSafeSdk"
import { BigNumber, ethers } from "ethers"
import ERC20TokenService from "services/ERC20TokenService"
import { SafeInfo } from "@gnosis.pm/safe-apps-sdk"
import { reload, transactionConfirmed, transactionFailed } from "actions"
import Oracle from "services/Oracle"
import DmmWeb3Service from "services/DmmWeb3Service"

const REPEAT_INTERVAL =
  (Number(process.env.REACT_APP_TRANSACTION_WAIT_INTERVAL) || 5) * 1000

const loadTokens = async (safeInfo: SafeInfo) => {
  const tokens = await DmmTokenService.getDmmTokens(
    CHAIN_ID_MAP[safeInfo.network]
  )

  for (const key in tokens) {
    const token = tokens[key as Erc20Token]

    const isEth = token.symbol === "ETH"

    const tokenContract = await ERC20TokenService.getInstance(token.address)

    await DmmWeb3Service.ready()

    const [balance, dmmBalance, exchangeRate] = await Promise.all([
      isEth
        ? ethers
            .getDefaultProvider(safeInfo.network)
            .getBalance(safeInfo.safeAddress)
        : tokenContract.balanceOf(safeInfo.safeAddress),
      DmmTokenService.balanceOf(token.dmmTokenAddress, safeInfo.safeAddress),
      DmmTokenService.getExchangeRate(token.dmmTokenAddress),
    ])
    tokens[key as Erc20Token] = {
      ...token,
      balance: balance.toString(),
      exchangeRate,
      dmmBalance,
    }
  }

  return tokens
}

const dataMiddleware = (store: any) => (next: Dispatch<Action>) => (
  action: Action
) => {
  const state = store.getState()

  switch (action.type) {
    case "SAFE_INFO_RECEIVED": {
      Oracle.getEthPrice().then((price) =>
        store.dispatch({
          type: "SET_ETH_PRICE",
          payload: { price: price.toString() },
        })
      )

      loadTokens(action.payload.safeInfo).then((tokens) =>
        store.dispatch(setTokens(tokens))
      )
      const { wallet } = state

      if (wallet.status === "disconnected") {
        wallet.connect("injected").then(() => {
          store.dispatch({ type: "SET_WALLET", payload: { wallet } })
        })
      }

      break
    }
    case "SAFE_TRANSACTION_CONFIRMED": {
      const { safeInfo } = state

      repeatUntil(
        async () => {
          try {
            return await gnosisSafeSdk.txs.getBySafeTxHash(
              action.payload.safeTxHash
            )
          } catch {
            return {}
          }
        },
        (tx: any) => !!tx.transactionHash,
        REPEAT_INTERVAL
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
    case "TRANSACTION_FAILED": {
      break
    }
    case "RELOAD": {
      const { safeInfo } = state
      loadTokens(safeInfo).then((tokens) => store.dispatch(setTokens(tokens)))
      break
    }
    case "MINT": {
      const { tokens } = state
      const { token, amount } = action.payload
      const amountBn = BigNumber.from(amount)
      const isEth = token === "ETH"
      const abi = isEth ? DmmEther : DmmToken

      Contract.getInstance(tokens[token].dmmTokenAddress, abi).then(
        async (instance) => {
          const txs = []
          if (!isEth) {
            const tokenContract = await ERC20TokenService.getInstance(
              tokens[token].address
            )

            txs.push({
              to: tokens[token].address,
              value: "0",
              data: tokenContract.encode("approve", [
                tokens[token].dmmTokenAddress,
                amountBn,
              ]),
            })
          }

          const data = isEth
            ? instance.contract.interface.encodeFunctionData("mintViaEther")
            : instance.contract.interface.encodeFunctionData("mint", [amountBn])

          txs.push({
            to: tokens[token].dmmTokenAddress,
            value: isEth ? amount : "0",
            data,
          })

          gnosisSafeSdk.sendTransactions(txs)
        }
      )
      break
    }
    case "REDEEM": {
      const { tokens } = state
      const { token, amount } = action.payload
      const isEth = token === "ETH"
      const abi = isEth ? DmmEther : DmmToken

      Contract.getInstance(tokens[token].dmmTokenAddress, abi).then(
        (instance) => {
          gnosisSafeSdk.sendTransactions([
            {
              to: tokens[token].dmmTokenAddress,
              value: "0",
              data: instance.contract.interface.encodeFunctionData("redeem", [
                amount,
              ]),
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
