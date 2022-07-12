const { exportDexTVL } = require('../helper/solana')

module.exports = {
  timetravel: false,
  methodology:
    "TVL includes the total token value inside the protocol's liquidity pools.",
  solana: {
    tvl: exportDexTVL('PSwapMdSai8tjrEXcxFeQth87xC4rRsa4VA5mhGhXkP'),
  },
}
