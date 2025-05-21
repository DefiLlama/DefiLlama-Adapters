
const { exportDexTVL, sumTokensExport } = require('../helper/solana')

module.exports = {
  timetravel: false,
  methodology: "TVL includes the total token value inside the protocol's liquidity pools.",
  solana: {
    tvl: exportDexTVL('SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr'),
    staking: sumTokensExport({ owners: ['9VAPorNsoCbCpSYNDxQsQaBJDvRVFc9VqaUczW2YYynQ'], tokens: ['SarosY6Vscao718M4A778z4CGtvcwcGef5M9MEH1LGL'] })
  },
}