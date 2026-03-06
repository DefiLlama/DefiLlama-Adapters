const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  bsquared: {
    tvl: sumTokensExport({ owners: ['0xd5B5f1CA0fa5636ac54b0a0007BA374A1513346e', '0xe677F4B6104726D76DeBc681d7a862CE269aA8F3'], tokens: [ADDRESSES.null] }),
  },
};
