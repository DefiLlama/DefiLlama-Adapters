const sdk = require('@defillama/sdk')

/*
async function tvl(timestamp, ethBlock, chainBlocks){
  const a = await transformAvaxAddress()
    return calculateUniTvl(a, chainBlocks.avax, 'avax', '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10', 0, true)
}
*/

const { getChainTvl } = require('../helper/getUniSubgraphTvl');


const graphUrls = {
  avax: 'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange',
}
const chainTvl = getChainTvl(graphUrls, "factories", "liquidityUSD")

module.exports = {
  misrepresentedTokens: true,
  methodology: 'We count liquidity on the pairs and we get that information from the "traderjoe-xyz/exchange" subgraph',
  tvl: chainTvl('avax'),
}