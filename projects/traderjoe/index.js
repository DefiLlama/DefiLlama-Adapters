const sdk = require('@defillama/sdk');
const { staking } = require('../helper/staking');
const joeBar = "0x57319d41F71E81F3c65F2a47CA4e001EbAFd4F33";
const joeToken = "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd";
const { getChainTvl } = require('../helper/getUniSubgraphTvl');
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
  }
};