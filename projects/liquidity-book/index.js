const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { staking } = require('../helper/staking');
const joeBar = ADDRESSES.avax.xJOE;
const joeToken = ADDRESSES.avax.JOE;
const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const graphUrls = {
  avax: 'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/joe-v2',
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'We count liquidity on the pairs and we get that information from the "traderjoe-xyz/joe-v2" subgraph.',
  avax:{
    tvl: getChainTvl(
         graphUrls, 
         "lbfactories", 
         "totalValueLockedUSD"
        )('avax'),
  }
};
