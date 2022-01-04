const { getChainTvl } = require('../helper/getUniSubgraphTvl');

const graphUrls = {
  kcc: 'https://info.kuswap.finance/subgraphs/name/kuswap/swap',
}
const chainTvl = getChainTvl(graphUrls)

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the dexes, pulling data from subgraphs",
  kcc: {
    tvl: chainTvl('kcc'),
  },
  tvl: chainTvl('kcc'),
}