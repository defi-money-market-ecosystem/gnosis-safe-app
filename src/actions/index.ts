import { SafeInfo } from "@gnosis.pm/safe-apps-sdk"
import { Erc20Token } from "types"

export const safeInfoReceived = (safeInfo: SafeInfo) => ({
  type: "SAFE_INFO_RECEIVED",
  payload: { safeInfo },
})

export const safeTransactionConfirmed = (safeTxHash: string) => ({
  type: "SAFE_TRANSACTION_CONFIRMED",
  payload: { safeTxHash },
})

export const safeTransactionRejected = () => ({
  type: "SAFE_TRANSACTION_REJECTED"
})

export const transactionConfirmed = (tx: any) => ({
  type: "TRANSACTION_CONFIRMED",
  payload: { tx },
})

export const transactionFailed = (reason: any) => ({
  type: "TRANSACTION_FAILED",
  payload: { reason },
})

export const reload = () => ({
  type: "RELOAD",
})

export const changeToken = (token: Erc20Token) => ({
  type: "CHANGE_TOKEN",
  payload: { token },
})

export const mint = (token: Erc20Token, amount: string) => ({
  type: "MINT",
  payload: { token, amount },
})
