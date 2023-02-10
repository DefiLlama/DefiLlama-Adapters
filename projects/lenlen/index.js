const axios = require("axios");

async function fetch() {
  let {data: response} = await axios.get('https://api.v-token.io/api/lenen/defiLlama')
  let tvl = 0
  if (response.code === 200 && response.data) {
    tvl = parseFloat(response.data.total_value_locked ?? '0') + parseFloat(response.data.total_borrow ?? '0')
  }
  
  return tvl;
}

module.exports = {
  fetch
}