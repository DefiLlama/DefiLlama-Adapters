const axios = require('axios');

async function tvl(api) {
  try {
    const response = await axios.get('https://staking-api.babylonlabs.io/v1/stats');
    const activeTvlSatoshis = response.data.data.active_tvl;
    const activeTvlBitcoin = activeTvlSatoshis / 100000000;
    
    console.log('Active TVL (in Bitcoin):', activeTvlBitcoin);

    if (activeTvlBitcoin && activeTvlBitcoin > 0) {
      console.log('Attempting to add TVL to API...');
      api.add('bitcoin', activeTvlBitcoin.toString());
      console.log('TVL added successfully:', activeTvlBitcoin);
    } else {
      console.error('No valid active TVL returned from API.');
    }
  } catch (error) {
    console.error('Error fetching or adding TVL:', error);
  }
}

module.exports = {
  methodology: 'The TVL is calculated by taking the total Bitcoin locked in the Babylon Chain staking protocol, fetched from the Babylon API.',
  start: 1729000000,
  timetravel: false,
  misrepresentedTokens: false,
  bitcoin: {
    tvl,
  },
};