const { sumTokensExport } = require("../helper/chain/ton");
const ADDRESSES = require("../helper/coreAssets.json");

module.exports = {
  ton: {
    tvl: sumTokensExport({ owner: "EQBUXXx7QXeogpRqlCEqvJrhLKLmLrJKqnB35V931v2gYdW-", tokens: [ADDRESSES.null] }),
  },
};
