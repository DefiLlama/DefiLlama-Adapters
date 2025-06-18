
const { exportDexTVL, sumTokensExport, } = require('../helper/solana');

const DEX_ID_V2 = 'SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr'


module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology:
    "TVL includes the total token value inside the protocol's liquidity pools.",
  solana: {
    tvl: exportDexTVL(DEX_ID_V2, undefined, undefined, { coreTokens: new Set() }),
    staking: sumTokensExport({ owners: ['9VAPorNsoCbCpSYNDxQsQaBJDvRVFc9VqaUczW2YYynQ'], tokens: ['SarosY6Vscao718M4A778z4CGtvcwcGef5M9MEH1LGL'] })
  },
}
