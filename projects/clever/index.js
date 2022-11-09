const sdk = require("@defillama/sdk");
const commonAbi = require("./abis/index.json")
const { default: BigNumber } = require("bignumber.js");
const { createIncrementArray, fetchURL } = require('../helper/utils');
const config = require("./config")
const lockCvxAddress = '0x96C68D861aDa016Ed98c30C810879F9df7c64154';
const cvxAddress = "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B";


async function farmTvl(balances, block) {
  const { output: gaugeTotalSupplies } = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: config.pools.map(i => ({ target: i.addresses.gauge })),
    block,
  })
  const { output: lpTotalSupplies } = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: config.pools.map(i => ({ target: i.addresses.token })),
    block,
  })

  await Promise.all(config.pools.map(async (item, i) => {
    const res = gaugeTotalSupplies.filter((itemSupply) => itemSupply.input.target.toLowerCase() == item.addresses.gauge.toLowerCase())
    const res1 = lpTotalSupplies.filter((itemSupply) => itemSupply.input.target.toLowerCase() == item.addresses.token.toLowerCase())
    let poolSupply = 0;
    let totalSupply = 0;
    if (res.length && res1.length) {
      poolSupply = res[0].output
      totalSupply = res1[0].output
    }
    await getTokenTvl(balances, item, poolSupply, totalSupply, block)
  }))
}

async function getTokenTvl(balances, poolData, poolSupply, totalSupply, block) {
  const coinsLength = poolData.coins.length
  const poolAddress = poolData.addresses.poolAddress
  const fromPlatform = poolData.fromPlatform
  if (fromPlatform.toLowerCase() == 'curve') {
    const coinCalls = createIncrementArray(coinsLength).map(num => {
      return {
        target: poolAddress,
        params: [num]
      }
    });
    let coins = await sdk.api.abi.multiCall({
      abi: commonAbi.curve.coinsUint,
      calls: coinCalls,
      block
    })
    if (!coins.output[0].success) {
      coins = await sdk.api.abi.multiCall({
        abi: commonAbi.curve.coinsInt,
        calls: coinCalls,
        block
      })
    }
    let coinBalances = []
    const tokens = coins.output.map(i => {
      return i.output;
    })
    let tempBalances = (await sdk.api.abi.multiCall({
      abi: commonAbi.curve.balances,
      calls: tokens.map((item, index) => {
        return {
          target: poolAddress,
          params: index
        }
      }),
      block
    })).output;
    tempBalances.map((item, index) => {
      coinBalances.push({ coin: tokens[index], balance: item.output })
    })
    coinBalances.map((coinBalance) => {
      let coinAddress = coinBalance.coin.toLowerCase()
      const balance = BigNumber(poolSupply * coinBalance.balance / totalSupply);
      if (!balance.isZero()) {
        sdk.util.sumSingleBalance(balances, coinAddress, balance.toFixed(0))
      }
    })
  } else {
    let balancerInfo = (await sdk.api.abi.call({
      abi: commonAbi.balancer.getPoolTokens,
      target: config.tokens.BalancerContract,
      params: [poolAddress],
      block,
    })).output
    balancerInfo.tokens.map((coins, index) => {
      let coinAddress = coins.toLowerCase()
      let coinBalances = balancerInfo.balances[index]
      const balance = BigNumber(poolSupply * coinBalances / totalSupply);
      if (!balance.isZero()) {
        sdk.util.sumSingleBalance(balances, coinAddress, balance.toFixed(0))
      }
    })
  }
  return balances
}

async function tvl(timestamp, block) {
  let balances = {}
  await farmTvl(balances, block)
  const totalLockedGlobal = (await sdk.api.abi.call({
    target: lockCvxAddress,
    block,
    abi: {
      "inputs": [],
      "name": "totalLockedGlobal",
      "outputs": [
        {
          "internalType": "uint128",
          "name": "",
          "type": "uint128"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  })).output
  if (!BigNumber(totalLockedGlobal).isZero()) {
    sdk.util.sumSingleBalance(balances, cvxAddress, BigNumber(totalLockedGlobal).toFixed(0))
  }
  return balances
}
module.exports = {
  ethereum: {
    tvl
  }
}
