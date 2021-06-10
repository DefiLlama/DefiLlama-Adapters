const axios = require('axios');

async function fetch() {
  var response = await axios.get('http://api.hyfi.pro/stat')
  return response.data.vault_tvl;
}

module.exports = {
  fetch
}
