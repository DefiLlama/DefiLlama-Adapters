// Constants
const POOL_CREATED_EVENT_TOPIC = '0x778cac0ae0b66477341553a4a89398c61ccf448313d3354ad0ca85a5a825d283';

// Factory addresses for each chain
const FACTORY_ADDRESSES = {
  xdai: ['0x08Df82f74D1f56F650E98da2dd4240F1A31711bc'], // Gnosis chain is called "xdai" in DefiLlama
  arbitrum: ['0xc1c2E092b7DbC8413E1aC02e92C161b0BDA783f6'],
  base: ['0xc93830dd463516ED5f28f6cd4F837173B87FF389'],
  optimism: ['0x1FAC47Cf25f1ca9F20ba366099D26b28401F5715'],
  polygon: ['0x57a9835B204DbCc101Dbf981625A3625e8043B9c'],
  celo: ['0xA71023bc64c9711C2037ab491DE80fd74504bd55']
};

// Helper function to decode pool creation event data
function decodePoolCreatedEvent(log) {
  const data = log.data;
  
  // Extract data based on the Dune query structure
  const poolId = `0x${data.slice(2, 66)}`; // First 32 bytes
  const strategy = `0x${data.slice(90, 130)}`; // Extract address from bytes 33-64
  const community = `0x${data.slice(154, 194)}`; // Extract address from bytes 65-96  
  const token = `0x${data.slice(218, 258)}`; // Extract address from bytes 97-128
  
  return {
    poolId,
    strategy,
    community,
    token
  };
}

async function tvl(api) {
  const factories = FACTORY_ADDRESSES[api.chain] || [];
  
  if (factories.length === 0) {
    return; // No factories on this chain
  }

  // Get all pool creation events
  const poolCreationLogs = await api.getLogs({
    targets: factories,
    topics: [POOL_CREATED_EVENT_TOPIC],
    fromBlock: 0, // You might want to set a specific start block
  });

  // Decode all pool events to get strategy addresses and their tokens
  const pools = poolCreationLogs.map(log => decodePoolCreatedEvent(log));
  
  // Remove duplicates (same strategy-token pairs)
  const uniquePools = pools.reduce((acc, pool) => {
    const key = `${pool.strategy}-${pool.token}`;
    if (!acc.has(key)) {
      acc.set(key, pool);
    }
    return acc;
  }, new Map());

  const poolsArray = Array.from(uniquePools.values());

  if (poolsArray.length === 0) {
    return; // No pools found
  }

  // Get token balances for all strategy addresses
  const strategyAddresses = poolsArray.map(pool => pool.strategy);
  const tokenAddresses = poolsArray.map(pool => pool.token);

  // Batch call to get all balances
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: poolsArray.map(pool => ({
      target: pool.token,
      params: [pool.strategy]
    }))
  });

  // Add all balances to the API
  balances.forEach((balance, i) => {
    const pool = poolsArray[i];
    if (balance && balance > 0) {
      api.add(pool.token, balance);
    }
  });
}

// Alternative approach if you need to handle hardcoded token prices
async function tvlWithHardcodedPrices(api) {
  // Hardcoded prices from the Dune query
  const HARDCODED_PRICES = {
    // Gnosis
    '0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9': 2.0, // Honey
    '0xa555d5344f6FB6c65da19e403Cb4c1eC4a1a5Ee3': 1.0, // Bread
    // Optimism & Celo
    '0x4F604735c1cF31399C6E711D5962b2B3E0225AD3': 1.0, // Glo Dollar
  };

  // First run the standard TVL calculation
  await tvl(api);
  
  // Then handle tokens with hardcoded prices
  // Note: This is tricky in DefiLlama as it usually handles pricing automatically
  // You might need to discuss with the DefiLlama team about these specific tokens
}

module.exports = {
  methodology: 'Tracks TVL by summing token balances held in strategy addresses of funding pools. Pools are identified by PoolCreated events, and TVL represents tokens currently locked in strategy contracts across multiple chains (Gnosis chain is labeled as "xdai" in DefiLlama).',
  start: 1640995200, // January 1, 2022 - adjust based on when first pools were created
  
  xdai: {
    tvl,
  },
  arbitrum: {
    tvl,
  },
  base: {
    tvl,
  },
  optimism: {
    tvl,
  },
  polygon: {
    tvl,
  },
  celo: {
    tvl,
  }
};

// Additional helper functions you might need:

// Function to get all unique strategy addresses (useful for debugging)
async function getAllStrategies(api) {
  const factories = FACTORY_ADDRESSES[api.chain] || [];
  
  const poolCreationLogs = await api.getLogs({
    targets: factories,
    topics: [POOL_CREATED_EVENT_TOPIC],
    fromBlock: 0,
  });

  const strategies = poolCreationLogs.map(log => {
    const decoded = decodePoolCreatedEvent(log);
    return decoded.strategy;
  });

  return [...new Set(strategies)]; // Remove duplicates
}

// Function to get strategy-token pairs (useful for debugging)
async function getStrategyTokenPairs(api) {
  const factories = FACTORY_ADDRESSES[api.chain] || [];
  
  const poolCreationLogs = await api.getLogs({
    targets: factories,
    topics: [POOL_CREATED_EVENT_TOPIC],
    fromBlock: 0,
  });

  return poolCreationLogs.map(log => decodePoolCreatedEvent(log));
}
