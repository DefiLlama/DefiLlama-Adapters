const { getCuratorTvl } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets deposited into vaults curated by Rezerve',
  ethereum: {
    eulerVaultOwners: [
      '0x1f4817b5F2B2e71658251d905634C62FAb8e2033', // gnosis safe
      '0x5f5a6E0F769BBb9232d2F6EDA84790296b288974' // deployer wallet
    ],
    euler: [
      '0xc42d337861878baa4dc820d9e6b6c667c2b57e8a', // USDC
      '0xBAfC1A885e25C6F594e06F12edaeB46858547724', // frxUSD
      '0x3036155a3eD3e7F6FFf1E96e88f1FE51b6D2f3aD', // FRAX
    ],
  },
}

const tvl = (chain) => ({ tvl: async (api) => await getCuratorTvl(api, configs[chain]) })

module.exports = {
  doublecounted: true,
  methodology: configs.methodology,
  ethereum: tvl('ethereum'),
}
