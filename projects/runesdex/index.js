const axios = require('axios');

async function tvl(api) {
  const response = await axios.get('https://app.runesdex.com/v1/exchange');
  const activeTvlSatoshis = response.data.exchange_tvl_sat;
  const activeTvlBitcoin = activeTvlSatoshis / 1e8;

  if (activeTvlBitcoin > 0)
    api.addCGToken('bitcoin', activeTvlBitcoin)
  else
    throw new Error('RunesDex: Invalid TVL value');
}

module.exports = {
  methodology: 'TVL is fetched from RunesDex’s Staking API and represents the total Bitcoin locked in the RunesDex pools.',
  start: '2025-01-13',
  timetravel: false,
  bitcoin: {
    tvl,
  },
};