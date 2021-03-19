/*==================================================
  Modules
  ==================================================*/

const sdk = require('@defillama/sdk');
const _ = require('underscore');
const BigNumber = require('bignumber.js');

const abi = require('./abi');

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  let balances = {
    '0x0000000000000000000000000000000000000000': '0', // ETH
  };

  let poolLogs = await sdk.api.util.getLogs({
    target: '0x0Ba2e75FE1368d8d517BE1Db5C39ca50a1429441',
    topic: 'LOG_NEW_POOL(address,address)',
    keys: ['topics'],
    fromBlock: 11362346,
    toBlock: block
  }).then(r => r.output);

  poolLogs = poolLogs.concat(await sdk.api.util.getLogs({
    target: '0x967D77f1fBb5fD1846Ce156bAeD3AAf0B13020D1',
    topic: 'LOG_NEW_POOL(address,address,address)',
    keys: ['topics'],
    fromBlock: 11706591,
    toBlock: block
  }).then(r => r.output))

  let poolCalls = [];

  let pools = _.map(poolLogs, (poolLog) => {
    return `0x${poolLog[2].slice(26)}`
  });

  const poolTokenData = (await sdk.api.abi.multiCall({
    calls: _.map(pools, (poolAddress) => ({ target: poolAddress })),
    abi: abi.getCurrentTokens,
  })).output;

  _.forEach(poolTokenData, (poolToken) => {
    let poolTokens = poolToken.output;
    let poolAddress = poolToken.input.target;

    _.forEach(poolTokens, (token) => {
      poolCalls.push({
        target: token,
        params: poolAddress,
      });
    })
  });

  const [{output: poolBalances}, {output: tokensUnderlyings}] = await Promise.all([
    sdk.api.abi.multiCall({ block, calls: poolCalls, abi: 'erc20:balanceOf' }),
    sdk.api.abi.multiCall({ block, calls: poolCalls.map(c => ({target: c.target})), abi: abi.underlying })
  ]);

  for (let i = 0; i < poolBalances.length; i++) {
    const balanceOf = poolBalances[i];
    const tokenAddress = balanceOf.input.target;
    const underlying = _.find(tokensUnderlyings, t => t.input.target === tokenAddress);
    if (balanceOf.success) {
      const balance = balanceOf.output;
      const address = underlying.success ? underlying.output : tokenAddress;

      if (BigNumber(balance).toNumber() <= 0) {
        continue;
      }

      balances[address] = BigNumber(balances[address] || 0).plus(balance).toFixed();
    }
  }

  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: 'PowerIndex',
  token: null,
  category: 'dexes',
  start : 1606768668, // 11/30/2021 @ 08:37am (UTC)
  tvl
}
