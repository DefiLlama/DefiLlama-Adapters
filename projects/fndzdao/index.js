const axios = require('axios');
const retry = require('async-retry')

async function fetch() {
  const response = (
    await retry(
      async () => await axios.get('https://api.fndz.io/tvl/')
    )
  ).data;

  return response.result.current_tvl;
}

module.exports = {
  timetravel: false,
  bsc: {
    fetch
  },
  fetch,
};
