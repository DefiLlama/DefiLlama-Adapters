const { getUniTVL } = require('../helper/unknownTokens');

const factory = '0x3ca837175312070f4E4fF64972a199122Ee03805';

module.exports = {
  crossfi: {
    tvl: getUniTVL({
      factory,
      chain: 'crossfi',
      useDefaultCoreAssets: true,
    }),
  },
};