const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  polygon: {
    tvl: sumTokensExport({
      tokens: [
        ADDRESSES.polygon.WETH_1, // WETH
        ADDRESSES.polygon.DAI, // DAI
        '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8', // aWETH
        '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE', // aDAI
        ADDRESSES.polygon.aPolWMATIC, // aMATIC
      ],
      resolveUniV3: true,
      fetchCoValentTokens: true,
      owner: '0x03ebC6d159C41419747354bc819dF274Da9948B5'
    }),
  },
}