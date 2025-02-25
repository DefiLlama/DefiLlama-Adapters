const ADDRESSES = require('../helper/coreAssets.json')

const ADDR = {
  base: {
    DIAMOND: "0xd1a0d188e861ed9d15773a2f3574a2e94134ba8f",
    PINTO: "0xb170000aeefa790fa61d6e837d1035906839a3c8",
    PINTOWETH: "0x3e11001cfbb6de5737327c59e10afab47b82b5d3",
    PINTOCBETH: "0x3e111115a82df6190e36adf0d552880663a4dbf1",
    PINTOCBBTC: "0x3e11226fe3d85142b734abce6e58918d5828d1b4",
    PINTOWSOL: "0x3e11444c7650234c748d743d8d374fce2ee5e6c9",
    PINTOUSDC: "0x3e1133ac082716ddc3114bbefeed8b1731ea9cb1",
    // Underlying non-pinto tokens
    WETH: ADDRESSES.base.WETH,
    CBETH: "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
    CBBTC: ADDRESSES.ethereum.cbBTC,
    WSOL: "0x1c61629598e4a901136a81bc138e5828dc150d67",
    USDC: ADDRESSES.base.USDC
  }
};

const DEPLOYMENT = 1732035400;

// List of whitelisted pools and time time periods they are valid
const ALL_POOLS = {
  base: {
    [ADDR.base.PINTOWETH]: {
      startTime: DEPLOYMENT,
      endTime: Number.MAX_SAFE_INTEGER,
      underlying: [ADDR.base.PINTO, ADDR.base.WETH]
    },
    [ADDR.base.PINTOCBETH]: {
      startTime: DEPLOYMENT,
      endTime: Number.MAX_SAFE_INTEGER,
      underlying: [ADDR.base.PINTO, ADDR.base.CBETH]
    },
    [ADDR.base.PINTOCBBTC]: {
      startTime: DEPLOYMENT,
      endTime: Number.MAX_SAFE_INTEGER,
      underlying: [ADDR.base.PINTO, ADDR.base.CBBTC]
    },
    [ADDR.base.PINTOWSOL]: {
      startTime: DEPLOYMENT,
      endTime: Number.MAX_SAFE_INTEGER,
      underlying: [ADDR.base.PINTO, ADDR.base.WSOL]
    },
    [ADDR.base.PINTOUSDC]: {
      startTime: DEPLOYMENT,
      endTime: Number.MAX_SAFE_INTEGER,
      underlying: [ADDR.base.PINTO, ADDR.base.USDC]
    }
  },
};

function invalidTime(api) {
  return api.timestamp < DEPLOYMENT;
}

// Returns the whitelilisted pools for the given timestamp
function getPools(api) {
  const { chain, timestamp } = api;
  const pools = [];
  for (const contract in ALL_POOLS[chain]) {
    const pool = ALL_POOLS[chain][contract];
    if (timestamp >= pool.startTime && timestamp <= pool.endTime) {
      pools.push(contract);
    }
  }
  return pools;
}

// Gets the total supply of the given erc20 token
async function getTotalSupply(api, token) {
  const tokenSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: token
  });
  return Number(tokenSupply);
}

// Gets the reserves of the requested pool
async function getPoolReserves(api, pool) {

  pool = pool.toLowerCase();
  const poolBalances = await api.multiCall({
    calls: ALL_POOLS[api.chain][pool].underlying.map(token => ({
      target: token,
      params: pool
    })),
    abi: 'erc20:balanceOf'
  });

  return poolBalances.map((balance, i) => ({ token: ALL_POOLS[api.chain][pool].underlying[i], balance }));
}

// Returns the total silo'd amount of the requested token
async function getSiloDeposited(api, token) {
  const deposited = await api.call({
    abi: "function getTotalDeposited(address) external view returns (uint256)",
    target: ADDR[api.chain].DIAMOND,
    params: token
  });
  const germinating = await api.call({
    abi: "function getGerminatingTotalDeposited(address) external view returns (uint256)",
    target: ADDR[api.chain].DIAMOND,
    params: token
  });
  return parseInt(deposited) + parseInt(germinating);
}

/**
 * Returns the balances of the underlying tokens in the given pools of the given ratios
 * @param {*} api 
 * @param {string[]} pools - the pools to calculate the balances for
 * @param {number[]} ratios - proportions of the pool underlying to credit towards the resulting balance
 */
async function getPooledBalances(api, pools, ratios) {

  const pooledTokenBalances = {};

  const poolReserves = await Promise.all(pools.map(pool => getPoolReserves(api, pool)));

  for (let i = 0; i < pools.length; ++i) {
    const reserves = poolReserves[i];
    for (const reserve of reserves) {
      const ratioAmount = reserve.balance * ratios[i];
      pooledTokenBalances[reserve.token] = (pooledTokenBalances[reserve.token] ?? 0) + ratioAmount;
    }
  }
  return pooledTokenBalances;
}

// Pinto deposited in the Silo
async function staking(api) {
  if (invalidTime(api)) {
    return {};
  }
  return {
    [`${api.chain}:${ADDR.base.PINTO.toLowerCase()}`]: await getSiloDeposited(api, ADDR.base.PINTO)
  }
}

// Tokens in liquidity pools corresponding to LP tokens that are deposited in the Silo
async function pool2(api) {
  if (invalidTime(api)) {
    return {};
  }

  // Get the amount of LP tokens deposited in the silo
  const pools = getPools(api);
  const poolPromises = pools.map(pool => [
    getSiloDeposited(api, pool),
    getTotalSupply(api, pool)
  ]);
  // And determine how much of the pooled tokens correspond to those deposits
  const flatResolved = await Promise.all(poolPromises.flat());
  const ratios = [];
  for (let i = 0; i < flatResolved.length; i += 2) {
    if (flatResolved[i + 1] !== 0) {
      ratios.push(flatResolved[i] / flatResolved[i + 1]);
    } else {
      ratios.push(0);
    }
  }

  // Gets the underlying token balances for deposited LP tokens
  const pool2Balances = await getPooledBalances(api, pools, ratios);
  
  // Add chain info
  const retval = {};
  for (const token in pool2Balances) {
    retval[`${api.chain}:${token.toLowerCase()}`] = pool2Balances[token];
  }
  return retval;
}

module.exports = {
  methodology: "Counts the value of deposited Pinto and LP tokens in the Silo.",
  start: '2024-11-19',
  base: {
    tvl: () => ({}),
    pool2,
    staking
  },
};
