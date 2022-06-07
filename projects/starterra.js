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
  return { 'terrausd': (await pool2Only())}
}

async function tvl() {
  const total = await retry(
    async () => await axios.get("https://api.starterra.io/cmc?q=tvl")
  );
  const pool2Tvl = await pool2Only()

  return {'terrausd': (Number(total.data)-pool2Tvl) }
}


module.exports = {
  methodology: `TVL is the sum of Singel Asset Staking tokens i Liquidity pool tokens`,
  misrepresentedTokens: true,
  timetravel: false,
  terra: {
    pool2,
    tvl
  },
}