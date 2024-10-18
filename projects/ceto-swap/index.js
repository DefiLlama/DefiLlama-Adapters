const { getUniTVL } = require('../helper/unknownTokens');

const factory = '0xf50c8e257ccf3e2b58651f78e3c2dc83446d9c47';

module.exports = {
  manta: {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, }),
  },
};
