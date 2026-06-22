const { getUniTVL } = require('./helper/unknownTokens')
const factory = "0x632F04bd6c9516246c2df373032ABb14159537cd"

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools',
  bsc: {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, }),
    staking: async ()=>({}) // CORIS returning an incorrect staking value locked 
  },
}
