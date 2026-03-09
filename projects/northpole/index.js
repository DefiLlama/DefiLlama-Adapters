const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'The cumulative market value of each vault collateral is TVL',
  avax: {
    tvl: sumTokensExport({
      owner: '0xBBe7bF1c422eFBb5B2cB7a91A6f0AA7CdE86C1d3', tokens: [
        ADDRESSES.avax.WETH_e,
        ADDRESSES.avax.WBTC_e,
        ADDRESSES.avax.WAVAX,
        '0x321E7092a180BB43555132ec53AaA65a5bF84251',
      ]
    }),
  },
}