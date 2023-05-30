const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking');
const joeBar = ADDRESSES.avax.xJOE;
const joeToken = ADDRESSES.avax.JOE;
const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { getUniTVL } = require('../helper/unknownTokens');
const graphUrls = {
  avax: 'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange',
};

module.exports = {
  misrepresentedTokens: true,
  methodology: 'We count liquidity on the pairs and we get that information from the "traderjoe-xyz/exchange" subgraph. The staking portion of TVL includes the JoeTokens within the JoeBar contract.',
  avax:{
    tvl: getChainTvl(
         graphUrls, 
         "factories", 
         "liquidityUSD"
        )('avax'),
    staking: staking(joeBar, joeToken, "avax"),
  },
  bsc: {
    tvl: getUniTVL({ factory: '0x4f8bdc85e3eec5b9de67097c3f59b6db025d9986', useDefaultCoreAssets: true, })
  }
};