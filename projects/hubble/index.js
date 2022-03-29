const axios = require("axios");
const BigNumber = require('bignumber.js');
const {toUSDTBalances} = require('../helper/balances');
const HUBBLE_API = "https://api.hubbleprotocol.io";

const client = axios.create({
  baseURL: HUBBLE_API,
});

async function tvl() {
  const metrics = await client.get("/metrics");
  const tvl = new BigNumber(metrics.data.totalValueLocked);
  const staking = new BigNumber(metrics.data.hbb.staked).multipliedBy( metrics.data.hbb.price);
  return toUSDTBalances(tvl.minus(staking));
}

async function staking() {
  const metrics = await client.get("/metrics");
  const value = new BigNumber(metrics.data.hbb.staked).multipliedBy(metrics.data.hbb.price);
  return toUSDTBalances(value)
}

module.exports = {
  methodology: `To obtain the Hubble Protocol TVL we use the formula 'TVL = Total HBB Staked * Current HBB Price + Total Collateral Value + Total Stablecoin (USDH) in Stability Pool'.`,
  solana: {
    tvl,
    staking,
  },
}