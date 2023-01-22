const { get } = require('./helper/http')

async function fetch() {
  var response = await get('https://api.secretanalytics.xyz/secretswap/tvl')

  return response;
}

module.exports = {
  secret: {
    fetch
  },
  fetch
}