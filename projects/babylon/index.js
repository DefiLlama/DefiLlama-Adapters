// Babylon Chain TVL Adapter

const axios = require('axios');

async function tvl(api) {
  // Call the Babylon staking API to get the TVL data
  const response = await axios.get('https://staking-api.babylonlabs.io/v1/stats');
  const activeTvl = response.data.data.active_tvl;

  // Add the active TVL to the balances
  api.add('bitcoin', activeTvl);
}

module.exports = {
  methodology: 'The TVL is calculated by taking the total Bitcoin (in satoshis) locked in the Babylon Chain staking protocol.',
  start: 1729000000,
  timetravel: false,  // Disallow backfill as the API doesn't support timestamps
  misrepresentedTokens: false,
  bitcoin: {
    tvl,
  },
};