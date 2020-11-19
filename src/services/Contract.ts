import ethers from 'ethers';

class CustomContract {
  static instances: Record<string, CustomContract> = {}
  address: string
  abi: any
  contract: any
  initiated: boolean = false

  constructor(address: string, abi: any) {
    if (!address) {
      throw new Error('Address of contract not provided for constructor')
    }

    if (!abi) {
      throw new Error('ABI of contract not provided for constructor')
    }

    this.address = address
    this.abi = abi
  }

  async init() {
    if(this.initiated) {
      return
    }
    this.initiated = true
    const {ethereum} = window
    if (!ethereum) {
      throw new Error('MetaMask is not found')
    }

    if (!this.contract) {
      await ethereum?.enable()

      if (this.address) {
        const provider = new ethers.providers.Web3Provider(ethereum as any);

        const signer: any = provider.getSigner()
        this.contract = new ethers.Contract(this.address, this.abi, provider)
        if (signer) {
          this.contract.connect(signer)
        }
      }
    }
  }

  static async getInstance(address: string, abi: any) {
    if (!CustomContract.instances[address]) {
      CustomContract.instances[address] = new CustomContract(address, abi)
      await CustomContract.instances[address].init()
    }
    return CustomContract.instances[address]
  }

  async balanceOf(address: string) {
    await this.init()
    return this.contract.balanceOf(address)
  }
}

export default CustomContract;