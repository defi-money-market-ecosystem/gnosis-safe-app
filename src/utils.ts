import Big, { BigSource } from "big.js"
import { NETWORK_MAP, TOKENS, TOKEN_DETAILS, chainId } from "consts"
import { Erc20Token, ChainID } from "types"

export const getInfuraUrl = (network: string) =>
  `https://${network}.infura.io/v3/${process.env.REACT_APP_INFURA_TOKEN || ""}`

export const getTokenDetails = (chainId: ChainID, id: Erc20Token) => {
  const tokensByChain = TOKENS[chainId]

  if (!tokensByChain) {
    throw Error(`No token configuration for ${chainId}`)
  }

  return {
    ...TOKEN_DETAILS[id],
    address: id !== "ETH" ? tokensByChain[id] : "0x",
  }
}

export const getOracleAddressByNetwork = () => {
  const envName = `REACT_APP_ORACLE_${(NETWORK_MAP[chainId] as string).toUpperCase()}`

  return process.env[envName] as string
}

export const getDmmControllerAddress = () => {
  const envName = `REACT_APP_DMM_CONTROLLER_${(NETWORK_MAP[chainId] as string).toUpperCase()}`

  return process.env[envName] as string
}

export const repeatUntil = (task: Function, stoppingCondition: Function, interval = 2000, maxRepeats = 10) => new Promise((resolve, reject) => {
  let repeat = 0

  const job = async () => {
    repeat++
    const payload = await task()

    if (stoppingCondition(payload)) {
      resolve(payload)
      return
    }
    if(repeat === maxRepeats) {
      reject(payload)
      return
    }
    setTimeout(job, interval)
  }

  setTimeout(job, interval)
})

export const formatNumber = (number: BigSource, decimals = 0, accuracy: number | undefined) => new Big(number).times(`1e-${decimals}`).toFixed(accuracy)