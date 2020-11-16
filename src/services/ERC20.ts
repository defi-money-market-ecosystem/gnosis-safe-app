import IERC20 from 'abi/IERC20.json'
import ethers from 'ethers';

class ERC20TokenService {
  static instances: Record<string, ERC20TokenService> = {}
  address: string
  contract: any

  constructor(address: string) {
    if (!address) {
      throw new Error('Address of ERC20 token not provided for constructor')
    }

    this.address = address
    this.init()
  }

  async init() {
    const {ethereum} = window
    if (!ethereum) {
      throw new Error('MetaMask is not found')
    }

    const chainId = parseInt(process.env.REACT_APP_NETWORK_ID || '4')

    if (!this.contract) {
      await ethereum?.enable()

      if (chainId && this.address) {
        const provider = new ethers.providers.Web3Provider(ethereum as any);

        const signer: any = provider.getSigner()
        this.contract = new ethers.Contract(this.address, IERC20, provider)
        if (signer) {
          this.contract.connect(signer)
        }
      }
    }
  }

  static getInstance(address: string) {
    if (!ERC20TokenService.instances[address]) {
      ERC20TokenService.instances[address] = new ERC20TokenService(address)
    }
    return ERC20TokenService.instances[address]
  }

  async balanceOf(address: string) {
    await this.init()
    return this.contract.balanceOf(address)
  }

}

export default ERC20TokenService;