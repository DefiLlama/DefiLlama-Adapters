const axios = require('axios');

async function tvl(api) {
  try {
    const response = await axios.get('https://staking-api.babylonlabs.io/v1/stats');
    const activeTvl = response.data.data.active_tvl;

    
    console.log('Active TVL (in satoshis):', activeTvl);

    
    if (activeTvl) {
      api.add('bitcoin', activeTvl);
    } else {
      console.error('No active TVL returned from API.');
    }
  } catch (error) {
    console.error('Error fetching TVL:', error);
  }
}

module.exports = {
  methodology: 'The TVL is calculated by taking the total Bitcoin (in satoshis) locked in the Babylon Chain staking protocol.',
  start: 1729000000,
  timetravel: false, 
  misrepresentedTokens: false,
  bitcoin: {
    tvl,
  },
};