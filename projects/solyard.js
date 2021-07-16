const retry = require('./helper/retry')
const axios = require("axios");

async function fetch() {
  var response = await retry(async bail => await axios.get('https://solyard.finance/tvl'))

  return response.data.total - response.data['YARDv1'] - response.data['YARDv1-USDC'];
}

async function staking() {
  var response = await retry(async bail => await axios.get('https://solyard.finance/tvl'))

  return response.data['YARDv1'];
}

async function pool2() {
  var response = await retry(async bail => await axios.get('https://solyard.finance/tvl'))

  return response.data['YARDv1-USDC'];
}

module.exports = {
  staking:{
    fetch:staking
  },
  pool2:{
    fetch: pool2
  },
  fetch
}
