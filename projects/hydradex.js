const { blockQuery } = require('./helper/http')
const { getBlock } = require('./hydradex/getHydraV3SubgraphTvl')

async function tvl({ timestamp }) {
  const endpoint = 'https://info.hydradex.org/graphql'
  const block = await getBlock(endpoint, timestamp)
  const query = `query ($block: Float!){
    hydraswapFactories (block: { number: $block }) {
      totalLiquidityUSD
    }
    }`
  const { hydraswapFactories: [{ totalLiquidityUSD }] } = await blockQuery(endpoint, query, {
    api: {
      getBlock: () => block,
      block
    }
  })
  return { tether: totalLiquidityUSD }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the dex, pulling data from subgraph",
  hydra: {
    tvl,
  },
};