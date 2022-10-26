const { getChainTvl } = require('../helper/getUniSubgraphTvl');

module.exports = {
  misrepresentedTokens: true,
  ethpow: {
    tvl: getChainTvl({
      'ethpow': 'https://subgraph.minerswap.fi/subgraphs/name/pancakeswap/exchange'
    }, 'pancakeFactories')('ethpow')
  }
}
