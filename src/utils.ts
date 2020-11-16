export const getInfuraUrl = (network: string) =>  `https://${network}.infura.io/v3/${
    process.env.REACT_APP_INFURA_TOKEN || ""
  }`