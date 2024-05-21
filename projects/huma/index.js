const sdk = require('@defillama/sdk');
const CORE_ASSETS = require('../helper/coreAssets.json');
const abiPool = require('./abi/huma-pool.json');


const celo_pool_factory = '0x85c8dC49B8DaA709e65dd2182e500E8AC3CaA6C7'

async function getMaxPoolId(factory, chainName) {
  const poolFactoryContract = await sdk.api.abi.call({
    target: factory,
    abi: abiPool["poolId"],
    chain: chainName
  });
  return poolFactoryContract.output;
}

async function getPools(factory, chainName) {
  let pools = [];
  const maxPoolId = await getMaxPoolId(factory, chainName);
  for (let poolId = 1; poolId <= maxPoolId; poolId++) {
    const pool = await sdk.api.abi.call({
      target: factory,
      abi: abiPool["checkPool"],
      params: poolId,
      chain: chainName
    });
    pools.push(pool.output.poolAddress);
  }
  return pools;
}

const polygon_pools = {
  v1: {
    poolsUSDCCircle: [
      '0x3EBc1f0644A69c565957EF7cEb5AEafE94Eb6FcE',  // arf
    ],
    poolsUSDC: [
      '0xe8926adbfadb5da91cd56a7d5acc31aa3fdf47e5',  // Jia
      '0x95533e56f397152b0013a39586bc97309e9a00a7',  // BSOS
    ],
  }
};


const celo_pools = {
  v1: {
    pools: [
      '0xa190a0ab76f58b491cc36205b268e8cf5650c576',  // Jia
    ],
  },
};

async function celo() {
  const balances = {};
  const v2TotalUnderlyingResults = await sdk.api.abi.multiCall({
    calls: (await getPools(celo_pool_factory, 'celo')).map((address) => ({
      target: address
    })),
    abi: abiPool["totalAssets"],
    chain: 'celo'
  });

  v2TotalUnderlyingResults.output.forEach((tokenBalanceResult) => {
      const valueInToken = tokenBalanceResult.output;
      sdk.util.sumSingleBalance(balances, `celo:${CORE_ASSETS.celo.USDC}`, valueInToken)
  });


  const v1TotalUnderlyingResults = await sdk.api.abi.multiCall({
    calls: celo_pools.v1.pools.map((address) => ({
      target: address
    })),
    abi: abiPool["totalPoolValue"],
    chain: 'celo'
  });

  v1TotalUnderlyingResults.output.forEach((tokenBalanceResult) => {
      const valueInToken = tokenBalanceResult.output;
      sdk.util.sumSingleBalance(balances, `celo:${CORE_ASSETS.celo.cUSD}`, valueInToken)
  });

  return balances;
}

async function polygon() {
  const balances = {};

  const v1TotalUnderlyingResults = await sdk.api.abi.multiCall({
    calls: polygon_pools.v1.poolsUSDCCircle.map((address) => ({
      target: address
    })),
    abi: abiPool["totalPoolValue"],
    chain: 'polygon'
  });

  v1TotalUnderlyingResults.output.forEach((tokenBalanceResult) => {
      const valueInToken = tokenBalanceResult.output;
      sdk.util.sumSingleBalance(balances, `polygon:${CORE_ASSETS.polygon.USDC_CIRCLE}`, valueInToken)
  });

  const v1USDCTotalUnderlyingResults = await sdk.api.abi.multiCall({
    calls: polygon_pools.v1.poolsUSDC.map((address) => ({
      target: address
    })),
    abi: abiPool["totalPoolValue"],
    chain: 'polygon'
  });

  v1USDCTotalUnderlyingResults.output.forEach((tokenBalanceResult) => {
      const valueInToken = tokenBalanceResult.output;
      sdk.util.sumSingleBalance(balances, `polygon:${CORE_ASSETS.polygon.USDC}`, valueInToken)
  });

  return balances;
}


module.exports = {
  methodology: 'sum all tvls from all pools',
  start: 1716248276, //2023-05-01
  celo: {
    tvl: celo,
  },
  polygon: {
    tvl: polygon,
  }
}; 

