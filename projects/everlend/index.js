const axios = require('axios');
const retry = require('async-retry')

async function fetch() {
  const response = (
    await retry(
      async () => await axios.get('https://api.everlend.finance/api/v1/info')
    )
  ).data;

  return response.tvl;
}

module.exports = {
  timetravel: false,
  solana: {
    fetch
  },
  fetch,
};
