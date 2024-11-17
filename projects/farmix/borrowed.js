const sdk = require('@defillama/sdk');
const {sleep} = require("../helper/utils");
const {rateLimited} = require("./utils");
const {POOLS, UNDERLYING_JETTONS} = require('./constants');
const {transformBalances} = require('../helper/portedTokens');
const {call} = require('../helper/chain/ton');

async function getPoolBorrowedJettons(api, poolAddr, underlyingJettonAddr) {
  const balances = {};
  const result = await call({
    target: poolAddr,
    abi: 'get_expected_state',
    params: [['num', 0]]
  });
  await sleep(1000 * (2 * Math.random() + 3));
  const jettonBorrowedAmount = result[6];
  sdk.util.sumSingleBalance(balances, underlyingJettonAddr, jettonBorrowedAmount, api.chain);

  return transformBalances(api.chain, balances);
}

const getPoolBorrowedJettonsRateLimited = rateLimited(getPoolBorrowedJettons);

async function borrowed(api) {
  const balances = {};
  const singleBalances = await Promise.all(POOLS.map(async (poolAddr, i) => {
    return getPoolBorrowedJettonsRateLimited(api, poolAddr, UNDERLYING_JETTONS[i]);
  }))


  singleBalances.forEach((b) => sdk.util.mergeBalances(balances, b));

  return balances;
}


module.exports = {
  borrowed,
}