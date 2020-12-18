import IERC20 from 'abi/IERC20.json'
import DmmController from 'abi/DmmController.json'
import { MToken, Erc20Token, ChainID } from "types"
import { REVERSE_M_TOKEN_MAP, TOKEN_DETAILS, TokenDetailsType, TOKENS } from "consts"
import DmmWeb3Service from "./DmmWeb3Service"
import NumberUtil from "utils/NumberUtil"
import { Contract } from "ethers"
import { getDmmControllerAddress } from 'utils'

const baseUrl = "https://api.defimoneymarket.com"

const RIKEBY_ADDRESSES = {
  DAI: '0x2e15d1ac4c6e8b5c8dad543a98abbf058838d233',
  LINK: '',
  USDC: '0xd7a3d3e09c48dd0c15353728084ceab9ae4463fb',
  ETH: '0xf81766c9b2750f31d79fe2a41b4a189f253c7204',
  USDT: ''
}

export interface DmmTokenDetailsType extends TokenDetailsType {
  dmmTokenId: string
  dmmTokenSymbol: string
  dmmTokenAddress: string
  imageUrl: string
  address: string
  dmmBalance?: string
}

class DmmTokenService {
  static dmmTokenContracts: Record<string, Contract> = {}
  static dmmControllerContracts: Record<string, Contract> = {}

  static async getDmmTokens(chainId: ChainID): Promise<Record<Erc20Token, DmmTokenDetailsType>> {
    const response = await fetch(`${baseUrl}/v1/dmm/tokens`, {
      headers: { Accept: "application/json" },
    })
    const tokens = (await response.json())["data"]
    return tokens.reduce((map: any, token: any) => {
      const erc20Token: Erc20Token =
        REVERSE_M_TOKEN_MAP[token["symbol"] as MToken]

      const dmmTokenAddress = chainId === 4 ? RIKEBY_ADDRESSES[erc20Token] : token["dmm_token_address"]

      if (erc20Token && dmmTokenAddress) {
        return {
          ...map,
          [erc20Token]: {
            dmmTokenId: token["dmm_token_id"],
            dmmTokenSymbol: token["symbol"],
            dmmTokenAddress,
            imageUrl: token["image_url"],
            address: TOKENS[chainId][erc20Token],
            ...TOKEN_DETAILS[erc20Token],
          },
        }
      } else {
        return map
      }
    }, {})
  }

  static async getActiveSupply(dmmToken: any) {
    const response = await fetch(
      `${baseUrl}/v1/dmm/tokens/${dmmToken.dmmTokenId.toString(
        10
      )}/active-supply`,
      { headers: { Accept: "application/json" } }
    )
    const rawBN = new NumberUtil.BN(
      (await response.json())["data"]["active_supply"]
    )
    return DmmTokenService.convertNumberToWei(dmmToken.decimals, rawBN)
  }

  static async getTotalSupply(dmmToken: any) {
    const response = await fetch(
      `${baseUrl}/v1/dmm/tokens/${dmmToken.dmmTokenId.toString(
        10
      )}/total-supply`,
      { headers: { Accept: "application/json" } }
    )
    const rawBN = new NumberUtil.BN(
      (await response.json())["data"]["total_supply"]
    )
    return DmmTokenService.convertNumberToWei(dmmToken.decimals, rawBN)
  }

  static async getTotalTokensPurchased() {
    const response = await fetch(`${baseUrl}/v1/dmm/tokens/total-purchased`, {
      headers: { Accept: "application/json" },
    })
    const rawBN = new NumberUtil.BN(
      (await response.json())["data"]["total_tokens_purchased"]
    )
    return DmmTokenService.convertNumberToWei(18, rawBN)
  }

  static async addNewTokensToTotalTokensPurchased(transactionHash: string) {
    const response = await fetch(
      `${baseUrl}/v1/dmm/tokens/add-total-purchased-by-hash/${transactionHash}`,
      { headers: { Accept: "application/json" }, method: "POST" }
    )
    const rawBN = new NumberUtil.BN(
      (await response.json())["data"]["total_tokens_purchased"]
    )
    return DmmTokenService.convertNumberToWei(18, rawBN)
  }

  static convertNumberToWei(decimals: number, amountBN: any) {
    if (decimals === 18) {
      return amountBN
    } else if (decimals > 18) {
      const diff = decimals - 18
      return amountBN.div(new NumberUtil.BN(10).pow(new NumberUtil.BN(diff)))
    } /* decimals < 18 */ else {
      const diff = 18 - decimals
      return amountBN.mul(new NumberUtil.BN(10).pow(new NumberUtil.BN(diff)))
    }
  }

  static dmmTokenContract(dmmTokenAddress: string) {
    if(!DmmTokenService.dmmTokenContracts[dmmTokenAddress]) {
      DmmTokenService.dmmTokenContracts[dmmTokenAddress] = new DmmWeb3Service.instance.web3.eth.Contract(
        IERC20,
        dmmTokenAddress
      )
    }

    return DmmTokenService.dmmTokenContracts[dmmTokenAddress]
  }

  static dmmControllerContract(dmmControllerAddress: string) {
    if (!DmmTokenService.dmmControllerContracts[dmmControllerAddress]) {
      DmmTokenService.dmmControllerContracts[dmmControllerAddress] = new DmmWeb3Service.instance.web3.eth.Contract(
        DmmController,
        dmmControllerAddress
      )
    }

    return DmmTokenService.dmmControllerContracts[dmmControllerAddress]
  }

  static async getExchangeRate(dmmTokenAddress: string) {
    await DmmWeb3Service.ready()

    const dmmControllerAddress = getDmmControllerAddress()

    return DmmTokenService.dmmControllerContract(dmmControllerAddress).methods
      .getExchangeRate(dmmTokenAddress).call()
  }

  static async mint(dmmTokenAddress: string, owner: string, underlyingAmount: any) {
    await DmmWeb3Service.ready()
    return DmmTokenService.dmmTokenContract(dmmTokenAddress).methods
      .mint(underlyingAmount.toString(10))
      .send({ from: owner })
  }

  static async mintViaEther(
    dmmTokenAddress: string,
    owner: string,
    underlyingAmount: any
  ) {
    await DmmWeb3Service.ready()
    return DmmTokenService.dmmTokenContract(dmmTokenAddress).methods
      .mintViaEther()
      .send({ from: owner, value: underlyingAmount.toString(10) })
  }

  static async redeem(dmmTokenAddress: string, owner: string, dmmAmount: any) {
    await DmmWeb3Service.ready()
    return DmmTokenService.dmmTokenContract(dmmTokenAddress).methods.redeem(dmmAmount.toString(10)).send({ from: owner })
  }

  static async balanceOf(dmmTokenAddress: string, account: string) {
    await DmmWeb3Service.ready()
    if(dmmTokenAddress === '0x') {
      return await DmmWeb3Service.instance.web3.eth.getBalance(account)
    }
    //return '0'
    return DmmTokenService.dmmTokenContract(dmmTokenAddress).methods.balanceOf(account).call()
  }
}

export default DmmTokenService
