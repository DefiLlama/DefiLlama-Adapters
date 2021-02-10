const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
  let hexStats = await retry(async bail => await axios.get('https://hexvisionbusinessapi.azurewebsites.net/api/stats'))
  return new BigNumber(hexStats.hexLockedSupply * hexStats.hexUsd).toFixed(2);
}

module.exports = {
  fetch
}