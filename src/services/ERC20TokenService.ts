import IERC20 from 'abi/IERC20.json'
import {ethers} from 'ethers';

class ERC20TokenService {
  static instances: Record<string, ERC20TokenService> = {}
  address: string
  contract: any
  initiated: Promise<ERC20TokenService>

  constructor(address: string) {
    if (!address) {
      throw new Error('Address of ERC20 token not provided for constructor')
    }

    this.address = address

    this.initiated = new Promise(async (resolve, reject) => {
      const { ethereum } = window

      if (!ethereum) {
        reject(new Error('MetaMask is not found'))
      }

      await ethereum?.send('eth_requestAccounts')
      
      const provider = new ethers.providers.Web3Provider(ethereum as any);
      this.contract = new ethers.Contract(address, IERC20, provider)
      const signer: any = provider.getSigner()
      console.log({address, IERC20, signer, provider})
      if (signer) {
        this.contract.connect(signer)
      }

      resolve(this)
    })
  }

  async ready() {
    return await this.initiated
  }

  static async getInstance(address: string) {
    const lowerCase = address.toLocaleLowerCase()
    if (!ERC20TokenService.instances[lowerCase]) {
      ERC20TokenService.instances[lowerCase] = new ERC20TokenService(lowerCase)
    }
    return ERC20TokenService.instances[lowerCase].ready()
  }

  async balanceOf(address: string) {
    console.log("balancce")
    await this.ready()
    return this.contract.balanceOf(address)
  }
}

export default ERC20TokenService;