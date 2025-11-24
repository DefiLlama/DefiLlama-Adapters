const { queryContract } = require('../helper/chain/cosmos');
const { transformBalances } = require('../helper/portedTokens');

// Valdora Staker contract address (https://docs.valdora.finance/smart-contracts)
const VALDORA_STAKER_CONTRACT = 'zig18nnde5tpn76xj3wm53n0tmuf3q06nruj3p6kdemcllzxqwzkpqzqk7ue55';

/**
 * Fetches the AUM from the Valdora Staker contract
 * 
 * How it works:
 * 1. Query the contract with funds_raised: "How much funds have been under management?"
 * 2. The contract responds with funds_raised (amount of uzig under management)
 * 
 * Returns the amount of uzig under management (or null if query fails)
 * Example: if 1000 uZIG are under management, returns 1000
 */
async function fetchAUM() {
  const { funds_raised } = await queryContract({
    contract: VALDORA_STAKER_CONTRACT,
    chain: 'zigchain',
    data: { funds_raised: {} },
  });

  if (!funds_raised || funds_raised === '0') return null;
  
  return funds_raised;
}


async function tvl(api) {
    try {
        const aum = await fetchAUM();
        const balances = api.getBalances();
        balances['zigchain:uzig'] = aum;
        return transformBalances('zigchain', balances);
    } catch (error) {
        console.error('Error calculating TVL:', error);
        throw error;
    }
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: false,
    methodology: 'TVL is calculated by fetching Valdora finance\'s AUM',
    zigchain: { tvl }
};