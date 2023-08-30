const axios = require('axios');

async function fetch() {
    const tvlJson = await axios.get('https://data.wisetoken.net/WISE/globals/tvl.json');
    return tvlJson.data.tvlLending;
}

module.exports = {
  ethereum: {
    fetch
  },
  fetch
};