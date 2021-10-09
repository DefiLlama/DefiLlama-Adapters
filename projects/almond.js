const retry = require('./helper/retry');
const axios = require('axios');

async function fetch() {
  const response = (
    await retry(
      async (bail) => await axios.get('https://api.almond.so/api/tvl')
    )
  ).data;

  const tvl = response.tvl;

  return tvl || 0;
}

module.exports = {
  fetch,
};
