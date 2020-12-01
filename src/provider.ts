import { ethers } from "ethers";

const {ethereum} = window;

const providerPromise: Promise<ethers.providers.Web3Provider> = new Promise(async(resolve, reject) => {
  if (!ethereum) {
    reject(new Error('MetaMask is not found'))
  }
  await ethereum?.send('eth_requestAccounts')
  resolve(new ethers.providers.Web3Provider(ethereum as any))
})

export default providerPromise