const { blockQuery } = require('../helper/http')
const { getBlock } = require('../hydradex/getHydraV3SubgraphTvl')

async function tvl(timestamp) {
  const endpoint = 'https://graph.hydradex.org/subgraphs/name/v3-subgraph'
  const block = +(await getBlock('https://graph.hydradex.org/subgraphs/name/blocklytics/ethereum-blocks', timestamp))
  const query = `query ($block: Int){
    factories (block: { number: $block }) {
      totalValueLockedUSD
    }
    }`
  const { factories: [{ totalValueLockedUSD }] } = await blockQuery(endpoint, query, {
    api: {
      getBlock: () => block,
      block
    }
  })
  return { tether: +totalValueLockedUSD }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the dex, pulling data from subgraph",
  hydra: {
    tvl,
  },
};
