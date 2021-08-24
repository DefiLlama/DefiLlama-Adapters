const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const sdk = require('@defillama/sdk')

const graphUrls = {
  kcc: 'https://info.shibance.com/subgraphs/name/shibance/exchange-kcc',
  bsc: 'https://api.thegraph.com/subgraphs/name/shibance/exchange-backup'
}
const chainTvl = getChainTvl(graphUrls)

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the dexes, pulling data from subgraphs",
  kcc: {
    tvl: chainTvl('kcc'),
  },
  /* outdated
  bsc: {
    tvl: chainTvl('bsc'),
  },
  */
  tvl: sdk.util.sumChainTvls(['kcc'].map(chainTvl))
}