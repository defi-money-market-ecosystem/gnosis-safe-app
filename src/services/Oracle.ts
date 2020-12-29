import { BigNumber, Contract, ethers, Wallet } from "ethers"
import providerPromise from "provider"
import { getOracleAddressByNetwork } from "utils"
import ChainlinkOracle from 'abi/ChainlinkOracle.json'

class Oracle {
  static instance: Oracle
  address: string
  provider: any
  contract: Contract

  constructor(provider: any, contractAddress: string) {
    if (!provider) {
      throw new Error("No provider provided for contract creation.")
    }
    if (!contractAddress) {
      throw new Error("No contract address provided.")
    }
    this.address = contractAddress
    this.provider = provider
    this.contract = new ethers.Contract(contractAddress, ChainlinkOracle, provider)
    const signer: Wallet = provider.getSigner()
    if (signer) {
      this.contract.connect(signer)
    }
  }

  static async getInstance() {
    if (!Oracle.instance) {
      const provider = await providerPromise
      Oracle.instance = new Oracle(provider, getOracleAddressByNetwork())
    }
    return Oracle.instance
  }

  static getEthPrice = async (): Promise<BigNumber> => {
    return (await (await Oracle.getInstance()).contract.latestRoundData()).answer
  }
}

export default Oracle
