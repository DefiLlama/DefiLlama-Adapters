const { graphQuery } = require('../helper/http')

const SUBGRAPH = 'https://graph.pulsechain.com/subgraphs/name/pulsechain/pulsexv2'

async function tvl(api) {
  const { pulseXFactories } = await graphQuery(SUBGRAPH, `{
    pulseXFactories {
      totalLiquidityUSD
    }
  }`)
  api.addUSDValue(+pulseXFactories[0].totalLiquidityUSD)
}

module.exports = {
  misrepresentedTokens: true,
  pulse: {
    tvl,
  },
};
