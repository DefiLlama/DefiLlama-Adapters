const sdk = require('@defillama/sdk');
const { transformBalances } = require('../helper/portedTokens');
const ADDRESSES = require('../helper/coreAssets.json');
const { call } = require('../helper/chain/ton');
const { POOL_ADDRESS } = require('./constants');

async function borrowed(api) {
  const balances = {};
  const result = await call({
    target: POOL_ADDRESS,
    abi: 'get_pool_data',
  });
  const borrowedTon = result[2];
  sdk.util.sumSingleBalance(balances, ADDRESSES.ton.TON, borrowedTon, api.chain);
  return transformBalances(api.chain, balances);
}

module.exports = {
  borrowed,
}
