const BigNumber = require('bignumber.js');
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

async function requery(results, chain, block, abi){
  if(results.some(r=>!r.success)){
    const failed = results.map((r,i)=>[r,i]).filter(r=>!r[0].success)
    const newResults = await sdk.api.abi
    .multiCall({
      abi,
      chain,
      calls: failed.map((f) => f[0].input),
      block,
    }).then(({ output }) => output);
    failed.forEach((f, i)=>{
      results[f[1]] = newResults[i]
    })
  }
}

async function calcTvl(getAddress, block, chain, FACTORY, START_BLOCK, useMulticall) {
  let poolAddresses;
  if (useMulticall) {
    const poolLength = (await sdk.api.abi.call({
      target: FACTORY,
      abi: abi.allPoolsLength,
      chain,
      block
    })).output
    if(poolLength === null){
      throw new Error("allPollsLength() failed")
    }
    const poolNums = Array.from(Array(Number(poolLength)).keys())
    const pools = (await sdk.api.abi.multiCall({
      abi: abi.allPools,
      chain,
      calls: poolNums.map(num => ({
        target: FACTORY,
        params: [num]
      })),
      block
    })).output
    await requery(pools, chain, block, abi.allPools);
    poolAddresses = pools.map(result => result.output.toLowerCase())
  } else {
    const logs = (
      await sdk.api.util
        .getLogs({
          keys: [],
          toBlock: block,
          chain,
          target: FACTORY,
          fromBlock: START_BLOCK,
          topic: 'poolCreated(address,address,address,uint32,uint256)',
        })
    ).output;

    poolAddresses = logs
      // sometimes the full log is emitted
      .map((log) =>
        typeof log === 'string' ? log : `0x${log.data.slice(64 - 40 + 2, 64 + 2)}`
      )
      // lowercase
      .map((poolAddress) => poolAddress.toLowerCase());
  }

  const [token0Addresses, token1Addresses, reserves] = await Promise.all([
    sdk.api.abi
      .multiCall({
        abi: abi.token0,
        chain,
        calls: poolAddresses.map((poolAddress) => ({
          target: poolAddress,
        })),
        block,
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: abi.token1,
        chain,
        calls: poolAddresses.map((poolAddress) => ({
          target: poolAddress,
        })),
        block,
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: abi.getReserves,
        chain,
        calls: poolAddresses.map((poolAddress) => ({
          target: poolAddress,
        })),
        block,
      }).then(({ output }) => output),
  ]);
  await requery(token0Addresses, chain, block, abi.token0);
  await requery(token1Addresses, chain, block, abi.token1);
  await requery(reserves, chain, block, abi.getReserves);

  const pools = {};
  // add token0Addresses
  token0Addresses.forEach((token0Address) => {
    const tokenAddress = token0Address.output.toLowerCase();

    const poolAddress = token0Address.input.target.toLowerCase();
    pools[poolAddress] = {
      token0Address: getAddress(tokenAddress),
    }
  });

  // add token1Addresses
  token1Addresses.forEach((token1Address) => {
    const tokenAddress = token1Address.output.toLowerCase();
    const poolAddress = token1Address.input.target.toLowerCase();
    pools[poolAddress] = {
      ...(pools[poolAddress] || {}),
      token1Address: getAddress(tokenAddress),
    }
  });

  const balances = reserves.reduce((accumulator, reserve, i) => {
      const poolAddress = reserve.input.target.toLowerCase();
      const pool = pools[poolAddress] || {};

      // handle reserve0
      if (pool.token0Address) {
        const reserve0 = new BigNumber(reserve.output['0']);
        if (!reserve0.isZero()) {
          const existingBalance = new BigNumber(
            accumulator[pool.token0Address] || '0'
          );

          accumulator[pool.token0Address] = existingBalance
            .plus(reserve0)
            .toFixed()
        }
      }

      // handle reserve1
      if (pool.token1Address) {
        const reserve1 = new BigNumber(reserve.output['1']);

        if (!reserve1.isZero()) {
          const existingBalance = new BigNumber(
            accumulator[pool.token1Address] || '0'
          );

          accumulator[pool.token1Address] = existingBalance
            .plus(reserve1)
            .toFixed()
        }
      }

    return accumulator
  }, {})

  return balances
};

module.exports = {
  calcTvl,
};