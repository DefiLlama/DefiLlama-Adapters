const { getChainTvl } = require("../helper/getUniSubgraphTvl")
module.exports={
  fantom:{
      tvl: getChainTvl({
          fantom: 'https://api.fura.org/subgraphs/name/spookyswap'
      })('fantom')
  }
}