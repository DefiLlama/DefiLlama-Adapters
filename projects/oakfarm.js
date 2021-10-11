const axios = require('axios');

async function fetch() {
  var response = await axios.get('https://api.oakfarm.io/stat')
  return response.data.data.multi_chain_tvl;
}

module.exports = {
  fetch
}
