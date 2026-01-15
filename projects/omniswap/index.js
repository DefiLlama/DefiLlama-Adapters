const { getUniTVL } = require('../helper/unknownTokens');

const { nibiru: nibiruCoreAssets } = require('../helper/coreAssets.json')

module.exports = {
  methodology: "TVL consists of liquidity pools created through the factory contract",
  misrepresentedTokens: true,
  nibiru: {
    tvl: getUniTVL({
      factory: "0x2043d6f72CcD82c4Eae36fF331ADAE8C77bA5897",
      chain: "nibiru",
      useDefaultCoreAssets: true,
      coreAssets: nibiruCoreAssets,
    }),
  },
};
