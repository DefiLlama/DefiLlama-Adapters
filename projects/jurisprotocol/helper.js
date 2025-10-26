const { queryContract } = require('../helper/chain/cosmos');

// Juris Protocol contract addresses on Terra Classic
const JURIS_STAKING_CONTRACT = 'terra1rta0rnaxz9ww6hnrj9347vdn66gkgxcmcwgpm2jj6qulv8adc52s95qa5y';
const JURIS_LENDING_CONTRACT = ''; // Add when lending is deployed

// Terra Classic token denominations
const TOKENS = {
  LUNC: 'uluna',
  USTC: 'uusd'
};

// Common query methods for Terra Classic contracts
const QUERY_METHODS = {
  staking: [
    { state: {} },
    { config: {} },
    { staking_state: {} },
    { total_staked: {} },
    { pool_info: {} },
    { info: {} }
  ],
  lending: [
    { market_state: {} },
    { total_borrowed: {} },
    { borrowed_info: {} },
    { supply_info: {} },
    { state: {} }
  ]
};

// Common field names for staking amounts
const STAKING_FIELDS = [
  'total_staked', 'total_stake', 'staked_amount', 'total_bonded',
  'bonded_amount', 'pool_size', 'total_deposit', 'total_balance'
];

// Common field names for lending amounts
const LENDING_FIELDS = {
  borrowed: ['total_borrowed', 'borrowed_amount', 'outstanding_debt', 'total_debt'],
  supplied: ['total_supply', 'supplied_amount', 'total_deposits', 'market_size']
};

/**
 * Query contract with multiple fallback methods
 * @param {string} contract - Contract address
 * @param {array} queryMethods - Array of query methods to try
 * @returns {object|null} Contract data or null if all methods fail
 */
async function queryContractWithFallback(contract, queryMethods) {
  if (!contract) return null;
  
  for (const query of queryMethods) {
    try {
      const data = await queryContract({
        contract,
        chain: 'columbus-5',
        data: query
      });
      
      if (data) return data;
    } catch (error) {
      continue;
    }
  }
  
  return null;
}

/**
 * Extract amount from contract response using field patterns
 * @param {object} data - Contract response data
 * @param {array} fields - Array of possible field names
 * @returns {string|null} Amount or null if not found
 */
function extractAmount(data, fields) {
  if (!data) return null;
  
  // Check direct fields
  for (const field of fields) {
    if (data[field]) {
      return data[field];
    }
  }
  
  // Check nested structures
  if (data.pool?.total_staked) return data.pool.total_staked;
  if (data.state?.total_staked) return data.state.total_staked;
  if (data.market?.total_supply) return data.market.total_supply;
  
  return null;
}

module.exports = {
  JURIS_STAKING_CONTRACT,
  JURIS_LENDING_CONTRACT,
  TOKENS,
  QUERY_METHODS,
  STAKING_FIELDS,
  LENDING_FIELDS,
  queryContractWithFallback,
  extractAmount
};
