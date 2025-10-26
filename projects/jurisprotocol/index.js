const { 
  JURIS_STAKING_CONTRACT,
  JURIS_LENDING_CONTRACT,
  TOKENS,
  QUERY_METHODS,
  STAKING_FIELDS,
  LENDING_FIELDS,
  queryContractWithFallback,
  extractAmount
} = require('./helper');

/**
 * Staking TVL calculation
 */
async function staking(api) {
  try {
    const stakingData = await queryContractWithFallback(
      JURIS_STAKING_CONTRACT, 
      QUERY_METHODS.staking
    );
    
    const amount = extractAmount(stakingData, STAKING_FIELDS);
    if (amount) {
      api.add(TOKENS.LUNC, amount);
    }
    
  } catch (error) {
    console.log('Juris Protocol Staking: Unable to fetch data');
  }
}

/**
 * Borrowed assets calculation (only if lending contract exists)
 */
async function borrowed(api) {
  if (!JURIS_LENDING_CONTRACT) return; // Skip if no lending contract
  
  try {
    const lendingData = await queryContractWithFallback(
      JURIS_LENDING_CONTRACT,
      QUERY_METHODS.lending
    );
    
    const amount = extractAmount(lendingData, LENDING_FIELDS.borrowed);
    if (amount) {
      api.add(TOKENS.LUNC, amount);
    }
    
  } catch (error) {
    console.log('Juris Protocol Lending: Unable to fetch borrowed data');
  }
}

/**
 * TVL calculation (combines staking + lending supply)
 */
async function tvl(api) {
  // Always include staking TVL
  await staking(api);
  
  // Only include lending supply if contract exists
  if (JURIS_LENDING_CONTRACT) {
    try {
      const lendingData = await queryContractWithFallback(
        JURIS_LENDING_CONTRACT,
        QUERY_METHODS.lending
      );
      
      const supplyAmount = extractAmount(lendingData, LENDING_FIELDS.supplied);
      if (supplyAmount) {
        api.add(TOKENS.LUNC, supplyAmount);
      }
      
    } catch (error) {
      console.log('Juris Protocol: Unable to fetch lending supply data');
    }
  }
}

// Base exports (always available)
const baseExports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'Juris Protocol TVL includes LUNC tokens staked in staking contracts. When lending is deployed, it will also include supplied assets minus borrowed amounts to avoid double counting.',
  start: 1698796800, // Update with actual launch timestamp
  terra: {
    tvl,
    staking // Always export staking since contract exists
  }
};

// Conditionally add borrowed function only if lending contract exists
if (JURIS_LENDING_CONTRACT) {
  baseExports.terra.borrowed = borrowed;
  
  // Update methodology when lending is available
  baseExports.methodology = 'Juris Protocol TVL includes LUNC tokens staked in staking contracts plus supplied assets in lending markets. Borrowed amounts are tracked separately to avoid double counting.';
}

module.exports = baseExports;
