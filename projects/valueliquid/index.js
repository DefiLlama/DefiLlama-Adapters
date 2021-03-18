/*==================================================
  Modules
==================================================*/

const sdk = require('../../sdk');
const getCurrentTokens = require('./abis/getCurrentTokens.json');
const _ = require('underscore');
const BigNumber = require("bignumber.js");

async function valueLiquidTvl(timestamp, block) {
  let balances = {
    '0x0000000000000000000000000000000000000000': '0', // ETH
  };

  let poolLogs = await sdk.api.util.getLogs({
    target: '0xEbC44681c125d63210a33D30C55FD3d37762675B',
    topic: 'LOG_NEW_POOL(address,address)',
    keys: ['topics'],
    fromBlock: 10961776,
    toBlock: block
  });

  let poolCalls = [];

  let pools = _.map(poolLogs.output, (poolLog) => {
    return `0x${poolLog[2].slice(26)}`
  });

  const poolTokenData = (await sdk.api.abi.multiCall({
    calls: _.map(pools, (poolAddress) => ({target: poolAddress})),
    abi: getCurrentTokens,
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

  let poolBalances = (await sdk.api.abi.multiCall({
    block,
    calls: poolCalls,
    abi: 'erc20:balanceOf'
  })).output;

  _.each(poolBalances, (balanceOf) => {
    if (balanceOf.success) {
      let balance = balanceOf.output;
      let address = balanceOf.input.target;

      if (new BigNumber(balance).toNumber() <= 0) {
        return;
      }

      balances[address] = new BigNumber(balances[address] || 0).plus(balance).toFixed();
    }
  });

  return balances;
}

async function tvl(timestamp, block) {
  return await valueLiquidTvl(timestamp, block);
}

/*==================================================
  Exports
==================================================*/
module.exports = {
  name: 'valueliquid',
  token: null,
  category: 'dexes',
  start: 1601440616,  // 09/30/2020 @ 4:36am (UTC)
  tvl,
};
