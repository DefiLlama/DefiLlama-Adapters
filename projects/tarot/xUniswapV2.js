const BigNumber = require('bignumber.js');

const sdk = require('@defillama/sdk');
const getReserves = require('./abis/getReserves.json');
const getTotalSupply = require('./abis/totalSupply.json');
const getTotalBalance = require('./abis/totalBalance.json');

const FACTORIES = [
  {
    name: "Tarot Classic",
    address: "0x35C052bBf8338b06351782A565aa9AaD173432eA",
    startBlock: 9926326
  },
  {
    name: "Tarot Requiem",
    address: "0xF6D943c8904195d0f69Ba03D97c0BAF5bbdCd01B",
    startBlock: 32494961
  },
  {
    name: "Tarot Carcosa",
    address: "0xbF76F858b42bb9B196A87E43235C2f0058CF7322",
    startBlock: 32950135
  }
];

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
      chain: 'fantom'
    })).output.reduce((accumulator, data, ) => {
      accumulator[data.input.target.toLowerCase()] = data.output;
      return accumulator;
    }, {});
}

module.exports = async function tvl(_, block, transform) {
  const logs = [];
  for (const factory of FACTORIES) {
    logs.push(
      ...(
        await sdk.api.util.getLogs({
          keys: [],
          toBlock: block,
          target: factory.address,
          fromBlock: factory.startBlock,
          topic: "LendingPoolInitialized(address,address,address,address,address,address,uint256)",
          chain: "fantom"
        })
      ).output
    );
  }
  if(logs.length<5){
    throw new Error("Log length is too low")
  }

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

  const reserves = await multiCallAndReduce(getReserves, pairAddresses, block);
  const totalSupplies = await multiCallAndReduce(getTotalSupply, pairAddresses, block);
  const totalBalances = await multiCallAndReduce(getTotalBalance, poolTokenAddresses, block);

  return lendingPools.reduce((accumulator, lendingPool, ) => {
    const reservesRaw = reserves[lendingPool.pairAddress];
    const totalSupplyRaw = totalSupplies[lendingPool.pairAddress];
    const collateralBalanceRaw = totalBalances[lendingPool.collateralAddress];
    const borrowable0BalanceRaw = totalBalances[lendingPool.borrowable0Address];
    const borrowable1BalanceRaw = totalBalances[lendingPool.borrowable1Address];

    const collateralBalance = new BigNumber(collateralBalanceRaw);
    const totalSupply = new BigNumber(totalSupplyRaw);

    if(totalSupplyRaw!=="0"){
    {
      const reserve0 = new BigNumber(reservesRaw['0']);
      const borrowable0Balance = new BigNumber(borrowable0BalanceRaw);
      const collateral0Balance = collateralBalance.multipliedBy(reserve0).dividedToIntegerBy(totalSupply)
      const existingBalance = new BigNumber(accumulator[transform(lendingPool.token0Address)] || '0');
      accumulator[transform(lendingPool.token0Address)] = existingBalance
        .plus(borrowable0Balance)
        .plus(collateral0Balance)
        .toFixed()
    }

    {
      const reserve1 = new BigNumber(reservesRaw['1']);
      const borrowable1Balance = new BigNumber(borrowable1BalanceRaw);
      const collateral1Balance = collateralBalance.multipliedBy(reserve1).dividedToIntegerBy(totalSupply)
      const existingBalance = new BigNumber(accumulator[transform(lendingPool.token1Address)] || '0');
      accumulator[transform(lendingPool.token1Address)] = existingBalance
        .plus(borrowable1Balance)
        .plus(collateral1Balance)
        .toFixed()
    }
    }

    return accumulator;
  }, {});
};
