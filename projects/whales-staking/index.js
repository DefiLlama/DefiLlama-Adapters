const { get } = require('../helper/http')

async function fetch() {
  const resp = await get('https://connect.tonhubapi.com/stats/staking')
  return resp.tvl;
}

module.exports = {
  fetch,
};
