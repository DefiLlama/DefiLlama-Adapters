const { queryContract } = require('../helper/chain/cosmos');

// Juris Protocol contracts
const JURIS_STAKING_CONTRACT = 'terra1rta0rnaxz9ww6hnrj9347vdn66gkgxcmcwgpm2jj6qulv8adc52s95qa5y';
const JURIS_LENDING_CONTRACT = '';
const JURIS_TOKEN_CONTRACT = 'terra1vhgq25vwuhdhn9xjll0rhl2s67jzw78a4g2t78y5kz89q9lsdskq2pxcj2'; // PROVIDE JURIS CW20 ADDRESS

// Token constants
const TOKENS = {
  LUNC: 'uluna',
  USTC: 'uusd',
  JURIS: JURIS_TOKEN_CONTRACT
};

// Query methods to try
const STAKING_QUERIES = [
  { state: {} },
  { config: {} },
  { balances: {} },
  { staking_info: {} },
  { total_staked: {} },
  { info: {} }
];

async function queryStakingContract() {
  for (const query of STAKING_QUERIES) {
    try {
      const data = await queryContract({
        contract: JURIS_STAKING_CONTRACT,
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

function extractTokenBalances(api, data) {
  if (!data) return;
  
  // Try different response structures
  
  // Direct balance fields
  if (data.lunc_balance) api.add(TOKENS.LUNC, data.lunc_balance);
  if (data.ustc_balance) api.add(TOKENS.USTC, data.ustc_balance);
  if (data.juris_balance && TOKENS.JURIS) api.add(TOKENS.JURIS, data.juris_balance);
  
  // Alternative field names
  if (data.uluna_balance) api.add(TOKENS.LUNC, data.uluna_balance);
  if (data.uusd_balance) api.add(TOKENS.USTC, data.uusd_balance);
  
  // Balances array
  if (Array.isArray(data.balances)) {
    data.balances.forEach(balance => {
      if (balance.denom === 'uluna') api.add(TOKENS.LUNC, balance.amount);
      if (balance.denom === 'uusd') api.add(TOKENS.USTC, balance.amount);
      if (balance.token === TOKENS.JURIS) api.add(TOKENS.JURIS, balance.amount);
    });
  }
  
  // Balances object
  if (data.balances && typeof data.balances === 'object' && !Array.isArray(data.balances)) {
    if (data.balances.uluna) api.add(TOKENS.LUNC, data.balances.uluna);
    if (data.balances.uusd) api.add(TOKENS.USTC, data.balances.uusd);
    if (data.balances.juris && TOKENS.JURIS) api.add(TOKENS.JURIS, data.balances.juris);
  }
  
  // State nested structure
  if (data.state) {
    if (data.state.lunc_staked) api.add(TOKENS.LUNC, data.state.lunc_staked);
    if (data.state.ustc_staked) api.add(TOKENS.USTC, data.state.ustc_staked);
    if (data.state.juris_staked && TOKENS.JURIS) api.add(TOKENS.JURIS, data.state.juris_staked);
  }
  
  // If total_staked exists and no other tokens found, assume it's JURIS
  if (data.total_staked && TOKENS.JURIS && !data.lunc_balance && !data.ustc_balance) {
    api.add(TOKENS.JURIS, data.total_staked);
  }
}

module.exports = {
  JURIS_STAKING_CONTRACT,
  JURIS_LENDING_CONTRACT,
  TOKENS,
  queryStakingContract,
  extractTokenBalances
};
