const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking');
const joeBar = ADDRESSES.avax.xJOE;
const joeToken = ADDRESSES.avax.JOE;
const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  methodology: 'We count liquidity on the pairs and we get that information from the "traderjoe-xyz/exchange" subgraph. The staking portion of TVL includes the JoeTokens within the JoeBar contract.',
  avax:{
    tvl: getUniTVL({ factory: '0x9ad6c38be94206ca50bb0d90783181662f0cfa10', useDefaultCoreAssets: true, }),
    staking: staking(joeBar, joeToken),
  },
  bsc: {
    tvl: getUniTVL({ factory: '0x4f8bdc85e3eec5b9de67097c3f59b6db025d9986', useDefaultCoreAssets: true, })
  },
  monad: {
    tvl: getUniTVL({ factory: '0xe32D45C2B1c17a0fE0De76f1ebFA7c44B7810034', useDefaultCoreAssets: true, })
  }
};