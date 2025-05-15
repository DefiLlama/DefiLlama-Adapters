
const { exportDexTVL } = require('../helper/solana')

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology:
    "TVL includes the total token value inside the protocol's liquidity pools.",
  solana: {
    tvl: exportDexTVL('SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr'),
  },
}