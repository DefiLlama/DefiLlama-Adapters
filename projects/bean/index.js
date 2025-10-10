const ADDRESSES = require('../helper/coreAssets.json')
const ADDR = {
  ethereum: {
    BEANSTALK: "0xc1e088fc1323b20bcbee9bd1b9fc9546db5624c5",
    BEAN_ERC20_V1: "0xdc59ac4fefa32293a95889dc396682858d52e5db",
    BEANETH_V1: "0x87898263b6c5babe34b4ec53f22d98430b91e371",
    BEAN3CRV_V1: "0x3a70dfa7d2262988064a2d051dd47521e43c9bdd",
    BEANLUSD_V1: "0xd652c40fbb3f06d6b58cb9aa9cff063ee63d465d",
    BEAN_ERC20: "0xbea0000029ad1c77d3d5d23ba2d8893db9d1efab",
    UNRIPE_BEAN_ERC20: "0x1bea0050e63e05fbb5d8ba2f10cf5800b6224449",
    UNRIPE_LP_ERC20: "0x1bea3ccd22f4ebd3d37d731ba31eeca95713716d",
    BEAN3CRV_V2: "0xc9c32cd16bf7efb85ff14e0c8603cc90f6f2ee49",
    BEANETH_V2: "0xbea0e11282e2bb5893bece110cf199501e872bad",
    // Underlying non-bean tokens
    WETH: ADDRESSES.ethereum.WETH,
    CRV3: "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490",
    LUSD: ADDRESSES.ethereum.LUSD
  },
  arbitrum: {
    BEANSTALK: "0xd1a0060ba708bc4bcd3da6c37efa8dedf015fb70",
    BEAN_ERC20: "0xbea0005b8599265d41256905a9b3073d397812e4",
    BEANWETH: "0xbea00aa8130acad047e137ec68693c005f8736ce",
    BEANWSTETH: "0xbea00bbe8b5da39a3f57824a1a13ec2a8848d74f",
    BEANWEETH: "0xbea00cc9f93e9a8ac0dfdff2d64ba38eb9c2e48c",
    BEANWBTC: "0xbea00dde4b34acdcb1a30442bd2b39ca8be1b09c",
    BEANUSDC: "0xbea00ee04d8289aed04f92ea122a96dc76a91bd7",
    BEANUSDT: "0xbea00ff437ca7e8354b174339643b4d1814bed33",
    UNRIPE_BEAN_ERC20: "0x1bea054dddbca12889e07b3e076f511bf1d27543",
    UNRIPE_LP_ERC20: "0x1bea059c3ea15f6c10be1c53d70c75fd1266d788",
    // Underlying non-bean tokens
    WETH: ADDRESSES.arbitrum.WETH,
    WSTETH: ADDRESSES.arbitrum.WSTETH,
    WEETH: ADDRESSES.arbitrum.weETH,
    WBTC: ADDRESSES.arbitrum.WBTC,
    USDC: ADDRESSES.arbitrum.USDC_CIRCLE,
    USDT: ADDRESSES.arbitrum.USDT
  }
};

/// REFERENCE                 BLOCKS    TIMESTAMPS
// Whitelist    BEANETH_V1    12974075  1628288832
// Dewhitelist  BEANETH_V1    14602790  165019825s6
// Whitelist    BEAN3CRV_V1   14218934  1645038020
// dewhitelist  BEAN3CRV_V1   14602790  1650198256
// whitelist    BEANLUSD_V1   14547427  1649451979
// dewhitelist  BEANLUSD_V1   14602790  1650198256
// EXPLOIT_BLOCK              14602790  1650198256
// REPLANT_BLOCK              15278963  1659657966
// whitelist    BEAN3CRV_V2   15278082  1659645914
// dewhitelist  BEAN3CRV_V2   19927634  1716407627
// whitelist    BEANETH_V2    18028591  1693412759
// dewhitelist  BEANETH_V2    x

const EXPLOIT_TIME = 1650198256;
const REPLANT_TIME = 1659657966;
const BIP12_TIME = 1645038020;
const ARB_MIGRATION_TIME = 1728529200;

// List of pools and time time periods they were valid within beanstalk
const ALL_POOLS = {
  ethereum: {
    [ADDR.ethereum.BEANETH_V1]: {
      startTime: 1628288832,
      endTime: EXPLOIT_TIME,
      underlying: [ADDR.ethereum.BEAN_ERC20_V1, ADDR.ethereum.WETH]
    },
    [ADDR.ethereum.BEAN3CRV_V1]: {
      startTime: 1645038020,
      endTime: EXPLOIT_TIME,
      underlying: [ADDR.ethereum.BEAN_ERC20_V1, ADDR.ethereum.CRV3]
    },
    [ADDR.ethereum.BEANLUSD_V1]: {
      startTime: 1649451979,
      endTime: EXPLOIT_TIME,
      underlying: [ADDR.ethereum.BEAN_ERC20_V1, ADDR.ethereum.LUSD]
    },
    [ADDR.ethereum.BEAN3CRV_V2]: {
      startTime: 1659645914,
      endTime: ARB_MIGRATION_TIME,
      underlying: [ADDR.ethereum.BEAN_ERC20, ADDR.ethereum.CRV3]
    },
    [ADDR.ethereum.BEANETH_V2]: {
      startTime: 1693412759,
      endTime: ARB_MIGRATION_TIME,
      underlying: [ADDR.ethereum.BEAN_ERC20, ADDR.ethereum.WETH]
    }
  },
  arbitrum: {
    [ADDR.arbitrum.BEANWETH]: {
      startTime: ARB_MIGRATION_TIME,
      endTime: 999999999999,
      underlying: [ADDR.arbitrum.BEAN_ERC20, ADDR.arbitrum.WETH]
    },
    [ADDR.arbitrum.BEANWSTETH]: {
      startTime: ARB_MIGRATION_TIME,
      endTime: 999999999999,
      underlying: [ADDR.arbitrum.BEAN_ERC20, ADDR.arbitrum.WSTETH]
    },
    [ADDR.arbitrum.BEANWEETH]: {
      startTime: ARB_MIGRATION_TIME,
      endTime: 999999999999,
      underlying: [ADDR.arbitrum.BEAN_ERC20, ADDR.arbitrum.WEETH]
    },
    [ADDR.arbitrum.BEANWBTC]: {
      startTime: ARB_MIGRATION_TIME,
      endTime: 999999999999,
      underlying: [ADDR.arbitrum.BEAN_ERC20, ADDR.arbitrum.WBTC]
    },
    [ADDR.arbitrum.BEANUSDC]: {
      startTime: ARB_MIGRATION_TIME,
      endTime: 999999999999,
      underlying: [ADDR.arbitrum.BEAN_ERC20, ADDR.arbitrum.USDC]
    },
    [ADDR.arbitrum.BEANUSDT]: {
      startTime: ARB_MIGRATION_TIME,
      endTime: 999999999999,
      underlying: [ADDR.arbitrum.BEAN_ERC20, ADDR.arbitrum.USDT]
    },
  }
};

function invalidTime(api) {
  if (api.chain === 'ethereum') {
    return (api.timestamp >= EXPLOIT_TIME && api.timestamp <= REPLANT_TIME) || api.timestamp >= ARB_MIGRATION_TIME;
  } else if (api.chain === 'arbitrum') {
    return false;
  }
}

// Returns the relevant tokens for the given timestamp
function getBean(timestamp) {
  if (timestamp <= EXPLOIT_TIME) {
    return ADDR.ethereum.BEAN_ERC20_V1;
  } else if ( timestamp <= ARB_MIGRATION_TIME) {
    return ADDR.ethereum.BEAN_ERC20;
  } else {
    return ADDR.arbitrum.BEAN_ERC20;
  }
}

// Returns the relevant pools for the given timestamp
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
  return await api.call({
    abi: 'erc20:totalSupply',
    target: token
  });
}

// Gets the reserves (for simplicity, contract balances) of the requested pool
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
  
  let result;
  if (api.timestamp <= BIP12_TIME) {
    // Prior to BIP12, there was no generalized deposit getter
    result = await api.call({
      abi: 
        token === ADDR.ethereum.BEAN_ERC20_V1
          ? "function totalDepositedBeans() public view returns (uint256)"
          : "function totalDepositedLP() public view returns (uint256)",
      target: ADDR[api.chain].BEANSTALK
    });
  } else {
    result = await api.call({
      abi: "function getTotalDeposited(address) external view returns (uint256)",
      target: ADDR[api.chain].BEANSTALK,
      params: token
    });
  }
  return parseInt(result);
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

// Gets the balances associated with the ripe portion of deposited unripe tokens
async function getRipePooledBalances(api, unripeToken) {

  const ripePooledTokenBalances = {};

  // Gets unripe's underlying token and amounts
  const [underlyingToken, underlyingPerUnripe, depositedUnripe] = await Promise.all([
    api.call({
      abi: "function getUnderlyingToken(address) external view returns (address)",
      target: ADDR[api.chain].BEANSTALK,
      params: unripeToken
    }),
    api.call({
      abi: "function getUnderlyingPerUnripeToken(address) external view returns (uint256)",
      target: ADDR[api.chain].BEANSTALK,
      params: unripeToken
    }),
    getSiloDeposited(api, unripeToken),
  ]);

  // Add the underlying pooled token balances
  const underlyingAmount = underlyingPerUnripe * depositedUnripe / Math.pow(10, 6);
  const BEAN = ADDR[api.chain].BEAN_ERC20;
  if (underlyingToken.toLowerCase() == BEAN) {
    ripePooledTokenBalances[BEAN] = (ripePooledTokenBalances[BEAN] ?? 0) + underlyingAmount;
  } else {
    const underlyingSupply = await getTotalSupply(api, underlyingToken);
    const ratio = underlyingAmount / underlyingSupply;
    const balances = await getPooledBalances(api, [underlyingToken.toLowerCase()], [ratio]);
    for (const token in balances) {
      ripePooledTokenBalances[token] = (ripePooledTokenBalances[token] ?? 0) + balances[token];
    }
  }
  return ripePooledTokenBalances;
}

// Beans deposited in the silo
async function staking(api) {
  if (invalidTime(api)) {
    return {};
  }

  // Bean deposits + ripe beans from unripe beans
  const bean = getBean(api.timestamp);
  const [siloBeans, unripeSiloBeans] = await Promise.all([
    getSiloDeposited(api, bean),
    getRipePooledBalances(api, ADDR[api.chain].UNRIPE_BEAN_ERC20)
  ]);
  const totalStaked = siloBeans + unripeSiloBeans[ADDR[api.chain].BEAN_ERC20];

  return {
    [`${api.chain}:${bean.toLowerCase()}`]: totalStaked
  }
}

// Tokens in liquidity pools corresponding to lp tokens that are deposited in the silo
async function pool2(api) {
  if (invalidTime(api)) {
    return {};
  }

  // Get the amount of lp tokens deposited in the silo
  const pools = getPools(api);
  const poolPromises = pools.map(pool => [
    getSiloDeposited(api, pool),
    getTotalSupply(api, pool)
  ]);
  // And determine how much of the pooled tokens correspond to those deposits
  const flatResolved = await Promise.all(poolPromises.flat());
  const ratios = [];
  for (let i = 0; i < flatResolved.length; i += 2) {
    ratios.push(flatResolved[i] / flatResolved[i + 1]);
  }

  // Gets the underlying token balances for both regular and unripe deposits
  const balancesResults = await Promise.all([
    getPooledBalances(api, pools, ratios),
    getRipePooledBalances(api, ADDR[api.chain].UNRIPE_LP_ERC20)
  ]);

  const pool2Balances = balancesResults[0];
  for (const token in balancesResults[1]) {
    pool2Balances[token] = (pool2Balances[token] ?? 0) + balancesResults[1][token];
  }
  
  // Add chain info
  const retval = {};
  for (const token in pool2Balances) {
    retval[`${api.chain}:${token.toLowerCase()}`] = pool2Balances[token];
  }
  return retval;
}

module.exports = {
  methodology: "Counts the value of deposited Beans and LP tokens in the silo.",
  start: '2021-08-07',
  ethereum: {
    tvl: () => ({}),
    pool2,
    staking
  },
  arbitrum: {
    tvl: () => ({}),
    pool2,
    staking
  },
  hallmarks: [
    // [EXPLOIT_TIME, "Governance Exploit"],
    [REPLANT_TIME, "Replant"],
    [ARB_MIGRATION_TIME, "Migration to Arbitrum"],
  ]
};
