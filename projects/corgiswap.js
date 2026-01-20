const { getUniTVL } = require('./helper/unknownTokens')
const factory = "0x632F04bd6c9516246c2df373032ABb14159537cd"

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://corgiswap.info/ as the source. Staking accounts for the CORIS locked in MasterChef (0x60E5Cf9111d046E8F986fC98e37d6703607d5Baf)',
  bsc: {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, }),
    staking: async ()=>({}) // CORIS returning an incorrect staking value locked 
  },
}
