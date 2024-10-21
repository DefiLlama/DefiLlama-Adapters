const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports, } = require('../helper/compound')
const sdk = require('@defillama/sdk')
const { getUniTVL } = require("../helper/unknownTokens");

const unitroller = '0x643dc7C5105d1a3147Bd9524DFC3c5831a373F1e'

const lendingMarket = compoundExports(unitroller, "0x2e909694B362c2FcA3C8168613bd47842245504B", ADDRESSES.cronos.WCRO_1,  {
  blacklistedTokens: [
    '0xa4434afeae0decb9820d906bf01b13291d00651a',
  ]
})

module.exports = {
  deadFrom: '2022-06-28',
  methodology: "Liquidity on DEX and supplied and borrowed amounts found using the unitroller address(0x643dc7C5105d1a3147Bd9524DFC3c5831a373F1e)",
    cronos: {
    //staking: stakingPricedLP("0x37619cC85325aFea778830e184CB60a3ABc9210B", "0x9A92B5EBf1F6F6f7d93696FCD44e5Cf75035A756", "moonriver", "0xbBe2f34367972Cb37ae8dea849aE168834440685", "moonriver"),
    tvl: sdk.util.sumChainTvls([
      getUniTVL({
        factory: '0xb89E86701C4Fe4a22a16914e3b0Df53eA4BE771b',
        useDefaultCoreAssets: true,
      }),
      lendingMarket.tvl
    ]),
    borrowed: lendingMarket.borrowed
  }
}

module.exports.cronos.borrowed = () => ({}) // bad debt