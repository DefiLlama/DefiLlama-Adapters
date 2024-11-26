const {getUniTVL} = require("../helper/unknownTokens");
const {staking} = require('../helper/staking')

const IXS_POLYGON = "0x1BA17C639BdaeCd8DC4AAc37df062d17ee43a1b8"
const IXS_BASE = "0xfe550bffb51eb645ea3b324d772a19ac449e92c5"
const STAKING_CONTRACTS = [
  "0xad644F3cC768bc6dceF97096790e2210D5191cec", // stake bank
]

module.exports = {
  polygon: {
    tvl: getUniTVL({factory: '0xc2D0e0bc81494adB71Ce9Aa350cC875DaE12D81D', blacklistedTokens: [IXS_POLYGON]}),
    staking: staking(STAKING_CONTRACTS, IXS_POLYGON),
  },
  base: {
    tvl: getUniTVL({factory: '0x2eE28d1Bbc2EcB1fFDB83E8055d585E9F0fb757f'}),
    staking: staking(['0x44F07B446e14127136f3554A16014b49BC67D9E6'], IXS_BASE),
  },
}
