import daiIcon from "./images/asset_DAI.svg";
import ethIcon from "./images/asset_ETH.svg";
import usdcIcon from "./images/asset_USDC.svg";
import usdtIcon from "./images/asset_USDT.svg";
import { Erc20Token, MToken } from 'types'

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

export const TOKENS = {
  1: {
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  4: {
    DAI: "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa",
    USDC: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
    USDT: "0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02",
  },
};

export interface TOKEN_DETAILS_TYPE {
  symbol: string
  label: string
  iconUrl: string
  decimals: number
}

export const TOKEN_DETAILS = {
  ETH: {
    symbol: 'ETH',
    label: 'ETH',
    iconUrl: ethIcon,
    decimals: 18
  },
  DAI: {
    symbol: "DAI",
    label: "DAI",
    iconUrl: daiIcon,
    decimals: 18,
  },
  USDC: {
    symbol: "USDC",
    label: "USDC",
    iconUrl: usdcIcon,
    decimals: 6,
  },
  USDT: {
    symbol: "USDT",
    label: "USDT",
    iconUrl: usdtIcon,
    decimals: 6,
  },
}

const { ethereum } = window

export const CHAIN_ID =
  (ethereum && parseInt((ethereum as any).chainId, 16)) ||
  parseInt(process.env.REACT_APP_NETWORK_ID || "4")