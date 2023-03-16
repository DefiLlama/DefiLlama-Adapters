const { get } = require('../helper/http')

async function fetch() {
  const resp = await get('https://api.filet.finance/pledge/ext/tx/pledgeTxAll')
  return resp.data.tvl;
}

module.exports = {
  fetch,
};
