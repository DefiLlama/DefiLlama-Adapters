const retry = require('./helper/retry');
const axios = require('axios');

async function fetch() {
  const response = (
    await retry(
      async (bail) => await axios.get('http://209.188.21.95:9000/')
    )
  ).data;

  return response.totalValueLocked;
}

module.exports = {
  timetravel: false,
  fetch,
};
