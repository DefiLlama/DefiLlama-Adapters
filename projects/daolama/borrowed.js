const ADDRESSES = require('../helper/coreAssets.json');
const { call } = require('../helper/chain/ton');
const { POOL_ADDRESS } = require('./constants');

async function borrowed(api) {
  const result = await call({
    target: POOL_ADDRESS,
    abi: 'get_pool_data',
  });
  const borrowedTon = result[2];
  api.add(ADDRESSES.ton.TON, borrowedTon);
}

module.exports = {
  borrowed,
}
