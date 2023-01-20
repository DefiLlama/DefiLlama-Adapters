const { getChainTvl } = require('../helper/getUniSubgraphTvl');

module.exports = {
  misrepresentedTokens: true,
  timetravel: true,
  fantom:{
    tvl: getChainTvl({
      fantom: 'https://api.thegraph.com/subgraphs/name/chimpydev/skullswap'
    })('fantom')
  },
    hallmarks:[
   ]
}
