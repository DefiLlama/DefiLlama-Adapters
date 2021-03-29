const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
  let acbtcPoolZero = await retry(async bail => await axios.get('https://api.acbtc.fi/ac/v2/pool-info?vault_id=0'));
  let acbtcPoolOne = await retry(async bail => await axios.get('https://api.acbtc.fi/ac/v2/pool-info?vault_id=1'));
  let plus = await retry(async bail => await axios.get('https://bsc-api.acbtc.fi/ac/v0/global'));
  let tvl = acbtcPoolZero.data.poolValue + acbtcPoolOne.data.poolValue;
  let btcPrice = plus.data.quote['BTC'];
  for (const [key, value] of Object.entries(plus.data.totalSupply)) {
    if (!key.endsWith("-gauge") && key !== 'AC') {
      tvl += value * btcPrice;
    }
  }
  return tvl;
}

module.exports = {
  fetch
}
