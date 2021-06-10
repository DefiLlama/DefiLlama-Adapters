const BigNumber = require('bignumber.js');

const sdk = require('@defillama/sdk');
const getReserves = require('./abis/getReserves.json');
const getTotalSupply = require('./abis/totalSupply.json');
const getTotalBalance = require('./abis/totalBalance.json');

const START_BLOCK = 10000835;
const FACTORY = '0x8c3736e2fe63cc2cd89ee228d9dbcab6ce5b767b';

function toAddress(str, skip = 0) {
  return `0x${str.slice(64 - 40 + 2 + skip * 64, 64 + 2 + skip * 64)}`.toLowerCase();
}

async function multiCallAndReduce(abi, targets, block) {
  return (await sdk.api.abi
    .multiCall({
      abi: abi,
      calls: targets.map((target) => ({
        target: target,
      })),
      block,
    })).output.reduce((accumulator, data, ) => {
      if (data.success) {
        accumulator[data.input.target.toLowerCase()] = data.output;
      }
      return accumulator;
    }, {});
}

module.exports = async function tvl(_, block) {
  const supportedTokens = await (
    sdk
      .api
      .util
      .tokenList()
      .then((supportedTokens) => supportedTokens.map(({ contract }) => contract))
  );

  const logs = (
    await sdk.api.util
      .getLogs({
        keys: [],
        toBlock: block,
        target: FACTORY,
        fromBlock: START_BLOCK,
        topic: 'LendingPoolInitialized(address,address,address,address,address,address,uint256)',
      })
  ).output;

  const lendingPools = [];
  for (const log of logs) {
    const pairAddress = toAddress(log.topics[1]);
    const token0Address = toAddress(log.topics[2]);
    const token1Address = toAddress(log.topics[3]);
    const collateralAddress = toAddress(log.data);
    const borrowable0Address = toAddress(log.data, 1);
    const borrowable1Address = toAddress(log.data, 2);
    const is0Supported = supportedTokens.includes(token0Address);
    const is1Supported = supportedTokens.includes(token1Address);
    lendingPools.push({
      pairAddress: pairAddress,
      token0Address: is0Supported ? token0Address : null,
      token1Address: is1Supported ? token1Address : null,
      collateralAddress: collateralAddress,
      borrowable0Address: is0Supported ? borrowable0Address : null,
      borrowable1Address: is1Supported ? borrowable1Address : null,
    });
  }

  const pairAddresses = lendingPools.map((lendingPool) => lendingPool.pairAddress);
  const poolTokenAddresses = [].concat(
    lendingPools.map((lendingPool) => lendingPool.borrowable0Address),
    lendingPools.map((lendingPool) => lendingPool.borrowable1Address),
    lendingPools.map((lendingPool) => lendingPool.collateralAddress),
  );

  const reserves = await multiCallAndReduce(getReserves, pairAddresses, block);
  const totalSupplies = await multiCallAndReduce(getTotalSupply, pairAddresses, block);
  const totalBalances = await multiCallAndReduce(getTotalBalance, poolTokenAddresses, block);

  return lendingPools.reduce((accumulator, lendingPool, ) => {
    const reservesRaw = reserves[lendingPool.pairAddress];
    const totalSupplyRaw = totalSupplies[lendingPool.pairAddress];
    const collateralBalanceRaw = totalBalances[lendingPool.collateralAddress];
    const borrowable0BalanceRaw = totalBalances[lendingPool.borrowable0Address];
    const borrowable1BalanceRaw = totalBalances[lendingPool.borrowable1Address];

    if (!reservesRaw || !totalSupplyRaw || !collateralBalanceRaw) return accumulator;

    const collateralBalance = new BigNumber(collateralBalanceRaw);
    const totalSupply = new BigNumber(totalSupplyRaw);

    if (lendingPool.token0Address && borrowable0BalanceRaw) {
      const reserve0 = new BigNumber(reservesRaw['0']);
      const borrowable0Balance = new BigNumber(borrowable0BalanceRaw);
      const collateral0Balance = collateralBalance.multipliedBy(reserve0).dividedToIntegerBy(totalSupply)
      const existingBalance = new BigNumber(accumulator[lendingPool.token0Address] || '0');
      accumulator[lendingPool.token0Address] = existingBalance
        .plus(borrowable0Balance)
        .plus(collateral0Balance)
        .toFixed()
    }

    if (lendingPool.token1Address && borrowable1BalanceRaw) {
      const reserve1 = new BigNumber(reservesRaw['1']);
      const borrowable1Balance = new BigNumber(borrowable1BalanceRaw);
      const collateral1Balance = collateralBalance.multipliedBy(reserve1).dividedToIntegerBy(totalSupply)
      const existingBalance = new BigNumber(accumulator[lendingPool.token1Address] || '0');
      accumulator[lendingPool.token1Address] = existingBalance
        .plus(borrowable1Balance)
        .plus(collateral1Balance)
        .toFixed()
    }

    return accumulator;
  }, {});
};
