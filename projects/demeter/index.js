const { get } = require('../helper/http')

async function fetch() {
  let results = await get('https://farming-api.cerestoken.io/get-supply-data');
  return results.tvl;
}

module.exports = {
  sora: {
    fetch
  },
  fetch
}