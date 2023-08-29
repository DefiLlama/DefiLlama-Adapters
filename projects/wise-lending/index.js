const sdk = require('@defillama/sdk');
const axios = require('axios');

async function tvl() {
    const tvlJson = await axios.get('https://data.wisetoken.net/WISE/globals/tvl.json');
    return tvlJson.data.tvlLending;
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ethereum: {
    tvl,
  }
};