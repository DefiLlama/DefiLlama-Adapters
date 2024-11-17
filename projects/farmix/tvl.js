const sdk = require('@defillama/sdk');
const { sleep } = require('../helper/utils')
const { rateLimited } = require('./utils');
const {POOLS, UNDERLYING_JETTONS} = require('./constants');
const {transformBalances} = require('../helper/portedTokens');
const {call} = require('../helper/chain/ton');

async function getPoolCurrentJettons(api, poolAddr, underlyingJettonAddr) {
  const balances = {};
  const result = await call({
    target: poolAddr,
    abi: 'get_expected_state',
    params: [['num', 0]]
  });
  await sleep(1000 * (2 * Math.random() + 3));
  const jettonCurrentAmount = result[5];
  sdk.util.sumSingleBalance(balances, underlyingJettonAddr, jettonCurrentAmount, api.chain);

  return transformBalances(api.chain, balances);
}

const getPoolJettonsRateLimited = rateLimited(getPoolCurrentJettons);


async function tvl(api) {
  const balances = {};
  const singleBalances = await Promise.all(POOLS.map(async (poolAddr, i) => {
    return getPoolJettonsRateLimited(api, poolAddr, UNDERLYING_JETTONS[i]);
  }))

  singleBalances.forEach((b) => sdk.util.mergeBalances(balances, b));

  return balances;
}

module.exports = {
  tvl,
}