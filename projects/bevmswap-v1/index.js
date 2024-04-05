const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { getUniTVL } = require('../helper/unknownTokens');

const v2graph = getChainTvl({
  bevm: 'https://subgraph.bevmswap.xyz/bevmswap-v1-bevm'
})

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'ianlapham/uniswapv2' subgraph`,
  bevm: {
    tvl: v2graph('bevm'),
  },
}

const config = {
  bevm: '0xAdEFa8CFD0655e319559c482c1443Cc6fa804C1F'
}

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, })
  }
})