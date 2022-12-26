const { getUniTVL } = require('../helper/unknownTokens')
const FACTORY = "0x971A5f6Ef792bA565cdF61C904982419AA77989f";
module.exports = {
  methodology: "TVL could the liquidity on the DEX, pairs are found using the Factory address: '0x971A5f6Ef792bA565cdF61C904982419AA77989f'.",
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      useDefaultCoreAssets: true,
      factory: FACTORY,
    }),
  },
};
