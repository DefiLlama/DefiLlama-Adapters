const { getChainTvl } = require('../helper/getUniSubgraphTvl');

module.exports = {
  timetravel: true,
  polygon:{
    tvl: getChainTvl({
      polygon: 'https://polygon.furadao.org/subgraphs/name/quickswap'
    })('polygon')
  },
}