const sdk = require('@defillama/sdk');
const _ = require('underscore');
const BigNumber = require('bignumber.js');
const curvePools = require('../convex/pools-crv.js')

const abi = require('./abi');

const gusd = '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd'
const curveFactoryPools = [
  "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA",
  "0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a"
].map(pool=>pool.toLowerCase())

async function tvl(timestamp, block) {
  let balances = {};

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

  const [{output: poolBalances}, {output: tokensUnderlyings}, {output: pricesPerFullShare}, {output: tokens}, {output:v2PricePerShare}] = await Promise.all([
    sdk.api.abi.multiCall({ block, calls: poolCalls, abi: 'erc20:balanceOf' }),
    sdk.api.abi.multiCall({ block, calls: poolCalls.map(c => ({target: c.target})), abi: abi.underlying }),
    sdk.api.abi.multiCall({ block, calls: poolCalls.map(c => ({target: c.target})), abi: abi.getPricePerFullShare }),
    sdk.api.abi.multiCall({ block, calls: poolCalls.map(c => ({target: c.target})), abi: abi.token }),
    sdk.api.abi.multiCall({ block, calls: poolCalls.map(c => ({target: c.target})), abi: abi.pricePerShare }),
  ]);

  for (let i = 0; i < poolBalances.length; i++) {
    const balanceOf = poolBalances[i];
    const tokenAddress = balanceOf.input.target;
    let underlying = _.find(tokensUnderlyings, t => t.input.target === tokenAddress);
    let pricePerFullShare = pricesPerFullShare[i];
    if(v2PricePerShare[i].success){
      pricePerFullShare = v2PricePerShare[i];
    }
    if(pricePerFullShare.success){
      underlying = tokens[i];
      const underlyingAddr = underlying.output.toLowerCase()

      const curvePool = curvePools.find(pool=>pool.addresses.lpToken.toLowerCase() === underlyingAddr)?.addresses.swap ?? curveFactoryPools.find(underlyingAddr)
      if(curvePool !== undefined){
        const virtualPrice = await sdk.api.abi.call({
          target: curvePool,
          abi: abi.get_virtual_price,
          block
        })
        underlying.output = gusd // Wrong, we just count all curve lp underlyings as GUSD
        balanceOf.output = BigNumber(balanceOf.output).times(virtualPrice.output).div(BigNumber(10).pow(18+18-2)).toFixed(0) // 2 decimals for GUSD
      }
      balanceOf.output = BigNumber(balanceOf.output).times(pricePerFullShare.output).div(BigNumber(10).pow(18)).toFixed(0)
    }
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

module.exports = {
  start : 1606768668, // 11/30/2021 @ 08:37am (UTC)
  tvl
}
