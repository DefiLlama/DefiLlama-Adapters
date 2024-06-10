const { getUniTVL } = require("../helper/unknownTokens");
const { staking } = require('../helper/staking')

const IXS_POLYGON = "0x1BA17C639BdaeCd8DC4AAc37df062d17ee43a1b8"
const STAKING_CONTRACTS = [
    "0xad644F3cC768bc6dceF97096790e2210D5191cec", // stake bank
]

module.exports = {
  polygon:{
    tvl: getUniTVL({ factory: '0xc2D0e0bc81494adB71Ce9Aa350cC875DaE12D81D', fetchBalances: true, blacklistedTokens: [IXS_POLYGON] }),
    staking: staking(STAKING_CONTRACTS, IXS_POLYGON),
  },
}