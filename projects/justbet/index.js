const axios = require('axios');

const WINR_HISTORY_API = 'https://gatewayv2.winr.games';

async function tvl() {
  try {
    const response = await axios.get(`${WINR_HISTORY_API}/api/analytics/token/stats`);
    
    const tvl = response.data.data.tvl
    
    return tvl;
  } catch (error) {
    return {};
  }
}

module.exports = {
  timetravel: false,
  start: '2023-03-22',
  methodology: 'TVL is fetched from Winr Protocol Historical API and represents the total LP and Staked WINR in the WINR staking protocol .',
  arbitrum: {
    tvl,
  },
};
