
const { exportDexTVL, sumTokens2, sumTokensExport } = require('../helper/solana')

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology:
    "TVL includes the total token value inside the protocol's liquidity pools.",
  solana: {
    tvl: async (...args) => {
      const dexTVL = await exportDexTVL('SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr')(...args)
      const sumTokensTVL = await sumTokensExport({ owners: ['9VAPorNsoCbCpSYNDxQsQaBJDvRVFc9VqaUczW2YYynQ'] })(...args)
      
      for (const token in sumTokensTVL) {
        if (!dexTVL[token]){
          dexTVL[token] = Number(sumTokensTVL[token])
        } else{
          dexTVL[token] += Number(sumTokensTVL[token])
        }
    }
      return dexTVL
    },
    staking: sumTokensExport({ owners: ['9VAPorNsoCbCpSYNDxQsQaBJDvRVFc9VqaUczW2YYynQ'], tokens: ['SarosY6Vscao718M4A778z4CGtvcwcGef5M9MEH1LGL'] })
  },
}
