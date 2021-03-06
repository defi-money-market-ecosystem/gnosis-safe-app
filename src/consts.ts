import { ChainID } from 'types'
import daiIcon from "./images/asset_DAI.svg"
import ethIcon from "./images/asset_ETH.svg"
import usdcIcon from "./images/asset_USDC.svg"
import usdtIcon from "./images/asset_USDT.svg"
import { Erc20Token, MToken } from "types"

export const NETWORK_MAP: Record<number, string> = {
  1: 'mainnet',
  4: 'rinkeby'
}

export const CHAIN_ID_MAP: Record<string, ChainID> = {
  'mainnet': 1,
  'rinkeby': 4
}

export const M_TOKEN_MAP: Record<Erc20Token, MToken> = {
  ETH: "mETH",
  DAI: "mDAI",
  USDC: "mUSDC",
  USDT: "mUSDT",
}

export const REVERSE_M_TOKEN_MAP: Record<MToken, Erc20Token> = {
  mETH: "ETH",
  mDAI: "DAI",
  mUSDC: "USDC",
  mUSDT: "USDT",
}

export const TOKENS: Record<ChainID, Record<Erc20Token, string>> = {
  1: {
    ETH: '0x',
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  4: {
    ETH: '0x23449A72c0a4FB056C1219dDB6E65c9d453B95AB',
    DAI: "0x3D6471999FecDA9d997abc68c4b13E745E4e05C9",
    USDC: "0xBD7f11536A14D73A9757c26014B6974aEF96fA4f",
    USDT: "0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02",
  },
}

export interface TokenDetailsType {
  symbol: Erc20Token
  label: string
  iconUrl: string
  decimals: number
  balance?: string
  exchangeRate?: string
}

export const TOKEN_DETAILS = {
  ETH: {
    symbol: "ETH" as Erc20Token,
    label: "ETH",
    iconUrl: ethIcon,
    decimals: 18,
  },
  DAI: {
    symbol: "DAI" as Erc20Token,
    label: "DAI",
    iconUrl: daiIcon,
    decimals: 18,
  },
  USDC: {
    symbol: "USDC" as Erc20Token,
    label: "USDC",
    iconUrl: usdcIcon,
    decimals: 6,
  },
  USDT: {
    symbol: "USDT" as Erc20Token,
    label: "USDT",
    iconUrl: usdtIcon,
    decimals: 6,
  },
}

const { ethereum } = window

export const chainId: ChainID = parseInt((ethereum as any)?.chainId) === 1 ? 1 : 4

export const interestPerSecond = 0.0000001981862

export const DECIMAL_PLACES = 8