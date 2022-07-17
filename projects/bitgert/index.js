const retry = require('async-retry')
const axios = require("axios");

async function fetch() {

  // staked brise
  let ret_staked_brise = await retry(async bail => await axios.get('https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x8FFf93E810a2eDaaFc326eDEE51071DA9d398E83&address=0xD578BF8Cc81A89619681c5969D99ea18A609C0C3&tag=latest&apikey=B3JDYTRMN3FVJFV65TF5XG3AU3CV8KY4AI'))

  // price in usd
  let ret_price = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitrise-token&vs_currencies=usd'))

  let price = ret_price.data["bitrise-token"]["usd"]
  let amount_staked = parseFloat(ret_staked_brise.data["result"]) / 1e9

  return amount_staked * price;
}

module.exports = {
  fetch
}