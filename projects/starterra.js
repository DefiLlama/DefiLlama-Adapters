const retry = require("./helper/retry");
const {toUSDTBalances} = require('./helper/balances')
const axios = require("axios");

async function pool2Only(){
  var res = await retry(
    async () =>
      await axios.get("https://api.starterra.io/cmc?q=tvl&onlyPool=true")
  );
  return parseFloat(res.data)
}

async function pool2() {
  return toUSDTBalances(await pool2Only())
}

async function tvl() {
  const total = await retry(
    async () => await axios.get("https://api.starterra.io/cmc?q=tvl")
  );
  const pool2Tvl = await pool2Only()

  return toUSDTBalances(Number(total.data)-pool2Tvl) 
}


module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  terra: {
    pool2,
    tvl
  },
}