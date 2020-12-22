import { Maybe } from 'types'
import { chainId } from 'consts'
import Onboard from "bnc-onboard";
import Notify from "bnc-notify";
import Web3 from "web3";
import BlockNativeWalletInterfaces from "./BlockNativeWalletInterfaces";
import { API } from 'bnc-onboard/dist/src/interfaces';

const infuraApiKey = '6016c4ab356b402ab455b2a8890efe7f';

const getRandomString = () => {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 40);
};

class DmmWeb3Service {

  static instance = new DmmWeb3Service();

  static onboard: API = DmmWeb3Service.instance.onboard;

  static notify: any;

  static walletAddress = () => DmmWeb3Service.onboard.getState().address;

  static walletChangeFns: Record<any, any> = {};

  static initiated: Maybe<Promise<DmmWeb3Service>> = null

  static watchHash(hash: string) {
    if (process.env.REACT_APP_ENVIRONMENT !== 'LOCAL') {
      DmmWeb3Service.notify.hash(hash);
    }
  }

  static onWalletChange(callback: Function) {
    const uid = getRandomString();
    DmmWeb3Service.walletChangeFns[uid] = callback;
  }

  static removeOnWalletChange(uid: any) {
    DmmWeb3Service.walletChangeFns[uid] = null;
  }

  web3: any = null
  wallet: any = null
  onboard: API

  constructor() {
    const walletInterfaces: any = new BlockNativeWalletInterfaces({infuraApiKey});
    this.onboard = DmmWeb3Service.onboard || Onboard({
      dappId: '9171b34b-ab20-4982-b3d9-43c073657a88',
      networkId: Number.parseInt(chainId+'' || '4'),
      walletSelect: {
        wallets: [
          {
            walletName: "coinbase",
            preferred: true,
            label: 'Coinbase Wallet'
          },
          {
            walletName: "trust",
            preferred: true,
            label: 'Trust Wallet',
          },
          {
            walletName: "metamask",
            preferred: true,
          },
          {
            walletName: "fortmatic",
            apiKey: "pk_live_45D9847605667E0F",
            preferred: true,
            label: 'Login with Email or Phone',
          },
          {
            walletName: "portis",
            apiKey: "54b3b7c2-8414-4d2c-bebf-4c928743c24a",
            preferred: true,
          },
          {
            walletName: "authereum"
          },
          {
            walletName: "walletConnect",
            infuraKey: infuraApiKey,
            preferred: true,
          },
          {
            walletName: "opera"
          },
          {
            walletName: "operaTouch"
          },
          {
            walletName: "torus",

            preferred: true,
          },
          {
            walletName: "status"
          },
          {
            walletName: "dapper",
          },
          ...walletInterfaces.allWalletInterfaces
        ],
      },
      subscriptions: {
        address: (address: string) => {
          Object.values(DmmWeb3Service.walletChangeFns).forEach((callbackFn) => {
            callbackFn(address);
          });
        },
        wallet: (wallet: any) => {
          this.web3 = new Web3(wallet.provider);
          this.wallet = wallet;
          if (window.localStorage && typeof window.localStorage.setItem === 'function') {
            window.localStorage.setItem('selectedWallet', wallet.name);
          }
        }
      }
    });
  }

  static async init() {
    let previousWallet;
    if (window.localStorage && typeof window.localStorage.getItem === 'function') {
      previousWallet = window.localStorage.getItem('selectedWallet');
    }

    if (!previousWallet && (window as any).web3 && (window as any).web3.currentProvider) {
      const currentProvider = (window as any).web3.currentProvider;
      if (currentProvider.isMetaMask) {
        // We don't automatically connect MetaMask because that's annoying and needs to approved by the user. In
        // comparison, the other dApp browsers below are automatically approved.
        previousWallet = undefined;
      } else if (currentProvider.isToshi) {
        previousWallet = 'Coinbase Wallet';
      } else if (currentProvider.isAlphaWallet) {
        previousWallet = 'Alpha Wallet';
      } else if (currentProvider.isTrust) {
        previousWallet = 'Trust Wallet';
      } else if (currentProvider.isStatus) {
        previousWallet = 'Status';
      }
    }

    if (previousWallet) {
      await DmmWeb3Service.onboard.walletSelect(previousWallet)
        .catch((error: any) => {
          console.error("Could not load previously cached wallet due to error: ", error);
        });
    } else {
      await DmmWeb3Service.onboard.walletSelect()
    }

    if (!DmmWeb3Service.notify) {
      DmmWeb3Service.notify = Notify({
        dappId: '9171b34b-ab20-4982-b3d9-43c073657a88',
        networkId: chainId,
      });
    }

    await DmmWeb3Service.onboard.walletCheck()

    return DmmWeb3Service.instance
  }

  static async ready() {
    if (DmmWeb3Service.initiated) {
      return DmmWeb3Service.instance
    }
    DmmWeb3Service.initiated = DmmWeb3Service.init()
    return await DmmWeb3Service.initiated
  }

}

export default DmmWeb3Service;