const BigNumber = require('bignumber.js');
const sdk = require('@defillama/sdk');
const token0 = require('./abis/token0.json');
const token1 = require('./abis/token1.json');
const getReserves = require('./abis/getReserves.json');
const factoryAbi = require('./abis/factory.json');

async function requery(results, chain, block, abi){
  if(results.some(r=>!r.success)){
    const failed = results.filter(r=>!r.success)
    const newResults = await sdk.api.abi
    .multiCall({
      abi,
      chain,
      calls: failed.map((f) => ({
        target: f.input.target,
      })),
      block,
    }).then(({ output }) => output);
  }
}

async function calculateUniTvl(getAddress, block, chain, FACTORY, START_BLOCK, useMulticall = false) {
  let pairAddresses;
  if (useMulticall) {
    const pairLength = (await sdk.api.abi.call({
      target: FACTORY,
      abi: factoryAbi.allPairsLength,
      chain,
      block
    })).output
    if(pairLength === null){
      throw new Error("allPairsLength() failed")
    }
    const pairNums = Array.from(Array(Number(pairLength)).keys())
    const pairs = (await sdk.api.abi.multiCall({
      abi: factoryAbi.allPairs,
      chain,
      calls: pairNums.map(num => ({
        target: FACTORY,
        params: [num]
      })),
      block
    })).output
    pairAddresses = pairs.map(result => result.output.toLowerCase())
  } else {
    const logs = (
      await sdk.api.util
        .getLogs({
          keys: [],
          toBlock: block,
          chain,
          target: FACTORY,
          fromBlock: START_BLOCK,
          topic: 'PairCreated(address,address,address,uint256)',
        })
    ).output;

    pairAddresses = logs
      // sometimes the full log is emitted
      .map((log) =>
        typeof log === 'string' ? log : `0x${log.data.slice(64 - 40 + 2, 64 + 2)}`
      )
      // lowercase
      .map((pairAddress) => pairAddress.toLowerCase());
  }

  const [token0Addresses, token1Addresses, reserves] = await Promise.all([
    sdk.api.abi
      .multiCall({
        abi: token0,
        chain,
        calls: pairAddresses.map((pairAddress) => ({
          target: pairAddress,
        })),
        block,
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: token1,
        chain,
        calls: pairAddresses.map((pairAddress) => ({
          target: pairAddress,
        })),
        block,
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: getReserves,
        chain,
        calls: pairAddresses.map((pairAddress) => ({
          target: pairAddress,
        })),
        block,
      }).then(({ output }) => output),
  ]);

  const pairs = {};
  // add token0Addresses
  token0Addresses.forEach((token0Address) => {
    const tokenAddress = token0Address.output.toLowerCase();

    const pairAddress = token0Address.input.target.toLowerCase();
    pairs[pairAddress] = {
      token0Address: getAddress(tokenAddress),
    }
  });

  // add token1Addresses
  token1Addresses.forEach((token1Address) => {
    const tokenAddress = token1Address.output.toLowerCase();
    const pairAddress = token1Address.input.target.toLowerCase();
    pairs[pairAddress] = {
      ...(pairs[pairAddress] || {}),
      token1Address: getAddress(tokenAddress),
    }
  });

  const balances = reserves.reduce((accumulator, reserve, i) => {
      const pairAddress = reserve.input.target.toLowerCase();
      const pair = pairs[pairAddress] || {};

      // handle reserve0
      if (pair.token0Address) {
        const reserve0 = new BigNumber(reserve.output['0']);
        if (!reserve0.isZero()) {
          const existingBalance = new BigNumber(
            accumulator[pair.token0Address] || '0'
          );

          accumulator[pair.token0Address] = existingBalance
            .plus(reserve0)
            .toFixed()
        }
      }

      // handle reserve1
      if (pair.token1Address) {
        const reserve1 = new BigNumber(reserve.output['1']);

        if (!reserve1.isZero()) {
          const existingBalance = new BigNumber(
            accumulator[pair.token1Address] || '0'
          );

          accumulator[pair.token1Address] = existingBalance
            .plus(reserve1)
            .toFixed()
        }
      }

    return accumulator
  }, {})

  return balances
};

module.exports = {
  calculateUniTvl,
};
