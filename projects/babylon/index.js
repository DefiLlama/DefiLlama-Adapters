const axios = require('axios');

async function tvl() {
  try {
    const response = await axios.get('https://staking-api.babylonlabs.io/v1/stats');
    const activeTvlSatoshis = response.data.data.active_tvl;
    const activeTvlBitcoin = activeTvlSatoshis / 1e8;

    if (activeTvlBitcoin && activeTvlBitcoin > 0) {
      return {
        bitcoin: activeTvlBitcoin,
      };
    } else {
      return {};
    }
  } catch (error) {
    return {};
  }
}

module.exports = {
  methodology: 'TVL is fetched from Babylon’s Staking API and represents the total Bitcoin locked in the Babylon staking protocol.',
  start: 1724351485, 
  timetravel: false,
  misrepresentedTokens: false,
  bitcoin: {
    tvl,
  },
};