const sdk = require('@defillama/sdk');
const axios = require('axios');
const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs');
const { nullAddress } = require('../helper/tokenMapping');

const config = {
  arbitrum: {
    factories: [
      '0x4FF3262Ba2983Ee8950d9d082f03277a58BF7eb1'
    ],
    positionsApi: 'https://arbitrum-nftlp-uniswapv3.up.railway.app/positions'
  },
  base: {
    factories: [
      '0x175712cD666FbcfE8B69866a3088D7bf17a47685',
    ],
    positionsApi: 'https://base-nftlp-uniswapv3.up.railway.app/positions'
  },
};

const blacklistedPools = {
  arbitrum: [],
  base: []
};

const abi = {
  // Borrowables
  underlying: "address:underlying",
  totalBalance: "uint256:totalBalance",
  totalBorrows: "function totalBorrows() view returns (uint112)",

  // Lending Pools
  allLendingPoolsLength: "uint256:allLendingPoolsLength",
  allLendingPools: "function allLendingPools(uint256) view returns (address)",
  getLendingPool: "function getLendingPool(address) view returns (bool initialized, uint24 lendingPoolId, address collateral, address borrowable0, address borrowable1)",

  // UniV3 pools
  slot0: "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
};

async function tvl(api) {
  const { factories, positionsApi } = config[api.chain];
  const blacklist = blacklistedPools[api.chain] || [];

  // All NFTLP positions
  if (positionsApi) {
    await processUniV3Positions(api, positionsApi);
  }

  await processBorrowables(api, factories, blacklist);

  return api.getBalances();
}

async function processUniV3Positions(api, positionsApiUrl) {
  console.log(`Fetching positions from API: ${positionsApiUrl}`);
  const response = await axios.get(positionsApiUrl);
  const positions = response.data;

  if (!Array.isArray(positions) || positions.length === 0) {
    console.log(`No positions found with api ${positionsApiUrl}`);
    return;
  }

  const poolsMap = {};
  positions.forEach(position => {
    if (!position.uniswapV3PoolId || position.liquidity === '0') return;

    const poolId = position.uniswapV3PoolId.toLowerCase();
    if (!poolsMap[poolId]) {
      poolsMap[poolId] = {
        token0: position.token0Id,
        token1: position.token1Id,
        positions: []
      };
    }

    poolsMap[poolId].positions.push({
      liquidity: position.liquidity,
      tickLower: position.tickLower,
      tickUpper: position.tickUpper
    });
  });

  // Get tick of all unique pools
  const poolAddresses = Object.keys(poolsMap);
  const slot0 = await api.multiCall({
    abi: abi.slot0,
    calls: poolAddresses,
    permitFailure: true
  });

  poolAddresses.forEach((poolAddress, i) => {
    const poolData = poolsMap[poolAddress];
    const slotData = slot0[i];

    poolData.positions.forEach(position => {
      addUniV3LikePosition({
        api,
        token0: poolData.token0,
        token1: poolData.token1,
        tick: slotData.tick,
        liquidity: position.liquidity,
        tickLower: position.tickLower,
        tickUpper: position.tickUpper
      });
    });
  });
}

// Same as impermax-v2 adapter
async function processBorrowables(api, factories, blacklist) {
  const pools = [];

  await Promise.all(factories.map(async (factory) => {
    const lendingPools = await api.fetchList({
      lengthAbi: abi.allLendingPoolsLength,
      itemAbi: abi.allLendingPools,
      target: factory
    });

    const filteredPools = lendingPools.filter(pool => !blacklist.includes(pool.toLowerCase()));

    const poolData = await api.multiCall({
      target: factory,
      abi: abi.getLendingPool,
      calls: filteredPools,
      permitFailure: true,
    });

    const initializedPools = poolData.filter(pool => pool.initialized);
    initializedPools.forEach(i => {
      pools.push(i.borrowable0, i.borrowable1);
    });
  }));

  const underlyings = await api.multiCall({
    abi: abi.underlying,
    calls: pools,
    permitFailure: true,
  });

  const tokensAndOwners = pools
    .map((owner, i) => [underlyings[i], owner])
    .filter(([token]) => token !== nullAddress);

  return sumTokens2({ api, tokensAndOwners });
}

// Same as impermax-v2 adapter
async function borrowed(api) {
  const { factories } = config[api.chain]
  const blacklist = blacklistedPools[api.chain]
  const balances = {}
  const borrowables = []
  await Promise.all(factories.map(async (factory) => {
    const lendingPools = await api.fetchList({ lengthAbi: abi.allLendingPoolsLength, itemAbi: abi.allLendingPools, target: factory })

    const filteredPoolData = lendingPools.filter(pool => {
      return !blacklist.includes(pool.toLowerCase())
    })

    const poolData = await api.multiCall({
      target: factory,
      abi: abi.getLendingPool,
      calls: filteredPoolData,
      permitFailure: true,
    })

    poolData.forEach(i => {
      borrowables.push(i.borrowable0, i.borrowable1)
    })
  }))

  const underlyings = await api.multiCall({
    abi: abi.underlying,
    calls: borrowables,
    permitFailure: true,
  })

  const borrowed = await api.multiCall({
    abi: abi.totalBorrows,
    calls: borrowables,
    permitFailure: true,
  })

  underlyings.forEach((v, i) => {
    sdk.util.sumSingleBalance(balances, v, borrowed[i], api.chain)
  })
  return balances
}


const module_exports = {};

Object.keys(config).forEach(chain => {
  module_exports[chain] = {
    tvl,
    borrowed
  };
});

module.exports = module_exports;
