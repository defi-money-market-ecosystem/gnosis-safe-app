import { MToken, Erc20Token } from "types"
import { REVERSE_M_TOKEN_MAP, TOKEN_DETAILS } from "consts"
import DmmToken from "abi/DmmToken.json"
import DmmEther from "abi/DmmEther.json"
import DmmWeb3Service from "./DmmWeb3Service"
import NumberUtil from "utils/NumberUtil"

const baseUrl = "https://api.defimoneymarket.com"

class DmmTokenService {
  static async getDmmTokens() {
    const response = await fetch(`${baseUrl}/v1/dmm/tokens`, {
      headers: { Accept: "application/json" },
    })
    const tokens = (await response.json())["data"]
    return tokens.reduce((map: any, token: any) => {
      const erc20Token: Erc20Token =
        REVERSE_M_TOKEN_MAP[token["symbol"] as MToken]

      return {
        ...map,
        [erc20Token]: {
          dmmTokenId: token["dmm_token_id"],
          dmmTokenSymbol: token["symbol"],
          dmmTokenAddress: token["dmm_token_address"],
          imageUrl: token["image_url"],
          address: token["underlying_token_address"],
          ...TOKEN_DETAILS[erc20Token],
        },
      }
    }, {})
  }

  static async getExchangeRate(dmmTokenId: any) {
    const response = await fetch(
      `${baseUrl}/v1/dmm/tokens/${dmmTokenId.toString(10)}/exchange-rate`,
      { headers: { Accept: "application/json" } }
    )
    return new NumberUtil.BN((await response.json())["data"]["exchange_rate"])
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

  static mint(dmmTokenAddress: string, owner: string, underlyingAmount: any) {
    const dmmToken = new DmmWeb3Service.instance.web3.eth.Contract(
      DmmToken,
      dmmTokenAddress
    )
    return dmmToken.methods
      .mint(underlyingAmount.toString(10))
      .send({ from: owner })
  }

  static mintViaEther(
    dmmTokenAddress: string,
    owner: string,
    underlyingAmount: any
  ) {
    const dmmToken = new DmmWeb3Service.instance.web3.eth.Contract(
      DmmEther,
      dmmTokenAddress
    )
    return dmmToken.methods
      .mintViaEther()
      .send({ from: owner, value: underlyingAmount.toString(10) })
  }

  static redeem(dmmTokenAddress: string, owner: string, dmmAmount: any) {
    const dmmToken = new DmmWeb3Service.instance.web3.eth.Contract(
      DmmToken,
      dmmTokenAddress
    )
    return dmmToken.methods.redeem(dmmAmount.toString(10)).send({ from: owner })
  }
}

export default DmmTokenService
