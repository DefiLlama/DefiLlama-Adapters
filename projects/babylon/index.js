const axios = require('axios');

async function tvl(api) {
  const response = await axios.get('https://staking-api.babylonlabs.io/v1/stats');
  const activeTvlSatoshis = response.data.data.active_tvl;
  const activeTvlBitcoin = activeTvlSatoshis / 1e8;

  if (activeTvlBitcoin > 0)
    api.addCGToken('bitcoin', activeTvlBitcoin)
  else
    throw new Error('Babylon: Invalid TVL value');
}

module.exports = {
  methodology: 'TVL is fetched from Babylon’s Staking API and represents the total Bitcoin locked in the Babylon staking protocol.',
  start: '2024-08-22',
  timetravel: false,
  bitcoin: {
    tvl,
  },
};