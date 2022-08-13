const axios = require("axios");
const { toUSDTBalances } = require('../helper/balances');
const HUBBLE_API = "https://api.hubbleprotocol.io";

const client = axios.create({
  baseURL: HUBBLE_API,
})

let _response

async function getData() {
  if (!_response) _response = client.get("/metrics")
  return _response
}

async function tvl() {
  const metrics = await getData()
  return toUSDTBalances(+metrics.data.collateral.total);
}

async function staking() {
  const metrics = await getData()
  return toUSDTBalances(metrics.data.hbb.staked * metrics.data.hbb.price)
}

module.exports = {
  timetravel: false,
  methodology: `To obtain the Hubble Protocol TVL we use the formula 'TVL = Total HBB Staked * Current HBB Price + Total Collateral Value + Total Stablecoin (USDH) in Stability Pool'.`,
  solana: {
    tvl,
    staking,
  },
}