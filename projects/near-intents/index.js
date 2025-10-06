const axios = require('axios');

async function tvl() {
  const response = await axios.get('https://app.near-intents.org/api/stats/tvl');
  return response.data.tvl;
}

module.exports = {
  timetravel: false,
  methodology: 'TVL calculated from tokens locked in NEAR Intents.',
  near: {
    tvl
  }
};
