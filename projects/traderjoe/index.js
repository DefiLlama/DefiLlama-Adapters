const sdk = require('@defillama/sdk')

/*
async function tvl(timestamp, ethBlock, chainBlocks){
  const a = await transformAvaxAddress()
    return calculateUniTvl(a, chainBlocks.avax, 'avax', '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10', 0, true)
}
*/

const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const joeBar = "0x57319d41F71E81F3c65F2a47CA4e001EbAFd4F33"
const joeToken = "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd"

const graphUrls = {
  avax: 'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange',
}
const chainTvl = getChainTvl(graphUrls, "factories", "liquidityUSD")

async function stakingTvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const stakedJoe = sdk.api.erc20.balanceOf({
    target: joeToken,
    owner: joeBar,
    chain: 'avax',
    block: chainBlocks.avax
  })
  sdk.util.sumSingleBalance(balances, 'avax:' + joeToken, (await stakedJoe).output)
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'We count liquidity on the pairs and we get that information from the "traderjoe-xyz/exchange" subgraph. The staking portion of TVL includes the JoeTokens within the JoeBar contract.',
  staking: {
    tvl: stakingTvl
  },
  tvl: chainTvl('avax'),
}