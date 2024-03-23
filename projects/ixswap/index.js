const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { stakings } = require("../helper/staking");


const IXS_POLYGON = "0x1BA17C639BdaeCd8DC4AAc37df062d17ee43a1b8"
const STAKING_CONTRACTS = [
    "0xad644F3cC768bc6dceF97096790e2210D5191cec", // stake bank
]

module.exports = {
  misrepresentedTokens: true,
  timetravel: true,
  polygon:{
    tvl: getChainTvl({
      polygon: 'https://api.thegraph.com/subgraphs/name/ix-swap/ixs'
    })('polygon'),
    staking: stakings(STAKING_CONTRACTS, IXS_POLYGON),
  },
}
