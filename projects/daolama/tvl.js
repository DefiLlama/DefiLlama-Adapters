const ADDRESSES = require('../helper/coreAssets.json');
const { POOL_ADDRESS } = require('./constants');
const { sumTokensExport } = require('../helper/chain/ton');

module.exports = {
  tvl: sumTokensExport({
    owners: [POOL_ADDRESS],
    tokens: [ADDRESSES.ton.TON, ADDRESSES.ton.USDT]
  }),
}
