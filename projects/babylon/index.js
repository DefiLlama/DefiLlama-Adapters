const axios = require('axios');

async function tvl() {
  try {
    console.log('Fetching TVL from Babylon API...');
    const response = await axios.get('https://staking-api.babylonlabs.io/v1/stats');
    console.log('Full API Response:', response.data);

    const activeTvlSatoshis = response.data.data.active_tvl;
    const activeTvlBitcoin = activeTvlSatoshis / 1e8;

    console.log('TVL in Bitcoin being added:', activeTvlBitcoin);

    if (activeTvlBitcoin && activeTvlBitcoin > 0) {
      const balances = {
        'bitcoin': activeTvlBitcoin,
      };
      console.log('TVL added successfully:', balances);
      return balances;
    } else {
      console.error('No valid active TVL returned from API.');
      return {};
    }
  } catch (error) {
    console.error('Error fetching or adding TVL:', error);
    return {};
  }
}

module.exports = {
  methodology: 'TVL is fetched from Babylon’s Staking API and represents the total Bitcoin locked in the Babylon staking protocol.',
  start: 1729000000,
  timetravel: false,
  misrepresentedTokens: false,
  bitcoin: {
    tvl,
  },
};