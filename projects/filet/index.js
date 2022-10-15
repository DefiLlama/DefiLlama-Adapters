const retry = require('async-retry');
const axios = require('axios');

async function fetch() {
  const resp = await retry(
    async () =>
      await axios.get('https://www.filet.finance/pledge/ext/tx/pledgeTxAll')
  );
  return resp.data.data.tvl;
}

module.exports = {
  fetch,
};
