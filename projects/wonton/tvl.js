const ADDRESSES = require("../helper/coreAssets.json");
const { POOL_CONTRACT, HIGHLOAD_CONTRACT } = require("./constants");
const { sumTokensExport } = require("../helper/chain/ton");

module.exports = {
  tvl: sumTokensExport({
    owners: [HIGHLOAD_CONTRACT, POOL_CONTRACT],
    tokens: ADDRESSES.ton.TON,
  }),
};
