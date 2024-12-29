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
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f', // GHO
      '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
      '0xdC035D45d973E3EC169d2276DDab16f1e407384F', // USDS
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', // WSTETH
      '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee', // WEETH
    ]
  },
  sonic: {
    vaults: [
      '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE',
      '0x3bcE5CB273F0F148010BbEa2470e7b5df84C7812'
    ],
    supportedAssets: [
      '0x29219dd400f2Bf60E5a23d13Be72B486D4038894', // USDC
      '0x309C92261178fA0CF748A855e90Ae73FDb79EBc7', // WETH
    ]
  },
}

Object.keys(config).forEach(chain => {
  const { vaults, supportedAssets } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ owners: vaults, tokens: supportedAssets})
  }
})