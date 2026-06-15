const { sumTokensExport } = require('../helper/unwrapLPs')

const RNT = '0x27ab6e82f3458edbc0703db2756391b899ce6324'
const STAKING = '0x0bDF6e4674B408CAC2fB00d840c549b4e410cf47'
const POOL = '0x4097073E82eDAC2D758eCfD594139A891340D59d' // RNT-USDT Sushiswap LP
const FARMING = '0xCfEE52CE10AA7E6a4ba219E56CE60207654815E9'

module.exports = {
  methodology: 'TVL counts the RNT-USDT Sushiswap LP tokens locked in the farming contract (unwrapped to their underlying assets). Staking counts the RNT staked in the staking contract.',
  polygon: {
    tvl: sumTokensExport({ owner: FARMING, tokens: [POOL], resolveLP: true }),
    staking: sumTokensExport({ owner: STAKING, tokens: [RNT] }),
  },
}
