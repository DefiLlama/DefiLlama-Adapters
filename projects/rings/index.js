const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  methodology: 'TVL counts the tokens deposited in the boring vaults.',
  start: 1733726867
}

const config = {
  ethereum: {
    vaults: [
      '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE',
      '0x3bcE5CB273F0F148010BbEa2470e7b5df84C7812',
    ],
    supportedAssets: [
      ADDRESSES.ethereum.USDC, // USDC
      '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c', // AAVEUSDC
      ADDRESSES.ethereum.USDT, // USDT
      '0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a', // AAVEUSDT
      '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f', // GHO
      '0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d', // STKGHO
      ADDRESSES.ethereum.DAI, // DAI
      ADDRESSES.ethereum.SDAI, // SDAI
      '0xdC035D45d973E3EC169d2276DDab16f1e407384F', // USDS
      ADDRESSES.ethereum.sUSDS, // SUSDS
      ADDRESSES.ethereum.WETH, // WETH
      '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8', // AAVEWETH
      ADDRESSES.ethereum.WSTETH, // WSTETH
      ADDRESSES.ethereum.WEETH, // WEETH
      '0xd63070114470f685b75B74D60EEc7c1113d33a3D' // USDO MORPHO
    ]
  },
  sonic: {
    vaults: [
      '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE',
      '0x3bcE5CB273F0F148010BbEa2470e7b5df84C7812'
    ],
    supportedAssets: [
      ADDRESSES.sonic.USDC_e, // USDC
      '0x50c42dEAcD8Fc9773493ED674b675bE577f2634b', // WETH
    ]
  },
}

Object.keys(config).forEach(chain => {
  const { vaults, supportedAssets } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owners: vaults, tokens: supportedAssets})
  }
})