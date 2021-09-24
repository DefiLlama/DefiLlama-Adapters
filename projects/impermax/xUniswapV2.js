const BigNumber = require('bignumber.js');

const sdk = require('@defillama/sdk');
const getReserves = require('./abis/getReserves.json');
const getTotalSupply = require('./abis/totalSupply.json');
const getTotalBalance = require('./abis/totalBalance.json');

function toAddress(str, skip = 0) {
  return `0x${str.slice(64 - 40 + 2 + skip * 64, 64 + 2 + skip * 64)}`.toLowerCase();
}

async function multiCallAndReduce(abi, chain, targets, block) {
  return (await sdk.api.abi
    .multiCall({
      chain,
      abi: abi,
      calls: targets.map((target) => ({
        target: target,
      })),
      block,
    })).output.reduce((accumulator, data, ) => {
      if (!data.success) {
        throw new Error("call failed")
      }
      accumulator[data.input.target.toLowerCase()] = data.output;
      return accumulator;
    }, {});
}

module.exports = async function tvl(block, chain, factory, startBlock) {
  if (block === undefined) return {};

  const logs = (
    await sdk.api.util
      .getLogs({
        chain,
        keys: [],
        toBlock: block,
        target: factory,
        fromBlock: startBlock,
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
    lendingPools.push({
      pairAddress: pairAddress,
      token0Address: token0Address,
      token1Address: token1Address,
      collateralAddress: collateralAddress,
      borrowable0Address: borrowable0Address,
      borrowable1Address: borrowable1Address,
    });
  }

  const pairAddresses = lendingPools.map((lendingPool) => lendingPool.pairAddress);
  const poolTokenAddresses = [].concat(
    lendingPools.map((lendingPool) => lendingPool.borrowable0Address),
    lendingPools.map((lendingPool) => lendingPool.borrowable1Address),
    lendingPools.map((lendingPool) => lendingPool.collateralAddress),
  );

  const [reserves, totalSupplies, totalBalances]  = await Promise.all([
    multiCallAndReduce(getReserves, chain, pairAddresses, block),
    multiCallAndReduce(getTotalSupply, chain, pairAddresses, block),
    multiCallAndReduce(getTotalBalance, chain, poolTokenAddresses, block)
  ]);
  console.log("calls finished")

  return lendingPools.reduce((accumulator, lendingPool, ) => {
    const reservesRaw = reserves[lendingPool.pairAddress];
    const totalSupplyRaw = totalSupplies[lendingPool.pairAddress];
    const collateralBalanceRaw = totalBalances[lendingPool.collateralAddress];
    const borrowable0BalanceRaw = totalBalances[lendingPool.borrowable0Address];
    const borrowable1BalanceRaw = totalBalances[lendingPool.borrowable1Address];

    const collateralBalance = new BigNumber(collateralBalanceRaw);
    const totalSupply = new BigNumber(totalSupplyRaw);

    if(totalSupply.isZero()) return accumulator

    {
      const reserve0 = new BigNumber(reservesRaw['0']);
      const borrowable0Balance = new BigNumber(borrowable0BalanceRaw);
      const collateral0Balance = collateralBalance.multipliedBy(reserve0).dividedToIntegerBy(totalSupply)
      const existingBalance = new BigNumber(accumulator[lendingPool.token0Address] || '0');
      accumulator[lendingPool.token0Address] = existingBalance
        .plus(borrowable0Balance)
        .plus(collateral0Balance)
        .toFixed()
    }

    {
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
