import { TOKENS, TOKEN_DETAILS } from "consts"
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
