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

const loadTokens = async (safeInfo: SafeInfo) => {
  const tokens = await DmmTokenService.getDmmTokens(
    CHAIN_ID_MAP[safeInfo.network]
  )

  console.log("loading tokens")

  for (const key in tokens) {
    console.log({ key })
    const token = tokens[key as Erc20Token]

    const balance =
      !!token.address &&
      !!safeInfo.safeAddress &&
      (token.symbol === "ETH"
        ? ethers.utils.parseEther(safeInfo.ethBalance).toString()
        : await (await ERC20TokenService.getInstance(token.address)).balanceOf(
            safeInfo.safeAddress
          )
      ).toString()

    const dmmBalance =
      !!token.dmmTokenAddress &&
      !!safeInfo.safeAddress &&
      // token.symbol === "ETH" ? await DmmWeb3Service.instance.web3.eth.getBalance(safeInfo.safeAddress) :
      (await DmmTokenService.balanceOf(
        token.dmmTokenAddress,
        safeInfo.safeAddress
      ))

    const exchangeRate = await DmmTokenService.getExchangeRate(token.dmmTokenId)
    tokens[key as Erc20Token] = { ...token, balance, exchangeRate, dmmBalance }
  }

  console.log({ tokens })
  return tokens
}

const dataMiddleware = (store: any) => (next: Dispatch<Action>) => (
  action: Action
) => {
  const state = store.getState()
  console.log({ action, state, where: "dataMiddleware" })
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
    case "TRANSACTION_FAILED": {
      console.log({ action })
      break
    }
    case "RELOAD": {
      const { safeInfo } = store.getState()
      loadTokens(safeInfo).then((tokens) =>
        store.dispatch({ type: "SET_TOKENS", payload: { tokens } })
      )
      break
    }
    case "MINT": {
      const { tokens, safeInfo } = store.getState()
      const { token, amount } = action.payload
      const amountBn = BigNumber.from(amount)
      const isEth = token === "ETH"
      const abi = isEth ? DmmEther : DmmToken

      Contract.getInstance(tokens[token].dmmTokenAddress, abi).then(
        async (instance) => {
          const txs = []
          if (!isEth) {
            const erc20TokenContract = (
              await ERC20TokenService.getInstance(tokens[token].address)
            ).contract
            const allowance = await erc20TokenContract.allowance(
              safeInfo.safeAddress,
              tokens[token].dmmTokenAddress
            )

            console.log({
              allowance: allowance.toString(),
              token: tokens[token],
            })
            if (!allowance.gte(amountBn)) {
              txs.push({
                to: tokens[token].address,
                value: '0',
                data: erc20TokenContract.interface.encodeFunctionData(
                  "approve",
                  [tokens[token].dmmTokenAddress, amountBn]
                ),
              })
            }
          }

          const data = isEth
            ? instance.contract.interface.encodeFunctionData("mintViaEther")
            : instance.contract.interface.encodeFunctionData("mint", [amountBn])

          txs.push({
            to: tokens[token].dmmTokenAddress,
            value: isEth ? amount : '0',
            data,
          })

          console.log({ txs, instance, amount })
          if (txs.length) {

            gnosisSafeSdk.sendTransactions(txs)
          }
        }
      )

      break
    }
    case "REDEEM": {
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
                isEth ? "redeemViaEther" : "redeem",
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
