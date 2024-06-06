const { compoundExports, } = require('../helper/compound')
const sdk = require('@defillama/sdk')
const { getUniTVL } = require("../helper/unknownTokens");

const unitroller = '0x643dc7C5105d1a3147Bd9524DFC3c5831a373F1e'

const lendingMarket = compoundExports(unitroller, "cronos", "0x2e909694B362c2FcA3C8168613bd47842245504B", "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23", undefined, undefined, {
  blacklistedTokens: [
    '0xa4434afeae0decb9820d906bf01b13291d00651a',
  ]
})

module.exports = {
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