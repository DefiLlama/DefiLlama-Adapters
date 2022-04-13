const axios = require('axios');

async function fetch() {
  const response = await axios.get('https://api-farm.odo.finance/api/v1/get-stats')
  return response.data.platformTVL;
}

module.exports = {
  fetch
}