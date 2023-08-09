const { get } = require('../helper/http')

async function fetch() {
  let results = await get('https://api.deotoken.com/api/demeter/supply-data');
  return results.tvl;
}

module.exports = {
  sora: {
    fetch
  },
  fetch
}