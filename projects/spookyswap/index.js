const { getChainTvl } = require("../helper/getUniSubgraphTvl")
module.exports={
  misrepresentedTokens: true,
  fantom:{
      tvl: getChainTvl({
          fantom: 'https://api.thegraph.com/subgraphs/name/eerieeight/spookyswap'
      })('fantom')
  }
}