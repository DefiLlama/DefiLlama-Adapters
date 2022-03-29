const axios = require("axios");
const BigNumber = require('bignumber.js');
const HUBBLE_API = "https://new-api.hubbleprotocol.io";

const client = axios.create({
  baseURL: HUBBLE_API,
});

async function tvl() {
  const metrics = await client.get("/metrics");
  const tvl = new BigNumber(metrics.data.totalValueLocked);
  const staking = new BigNumber(metrics.data.hbb.staked).multipliedBy( metrics.data.hbb.price);
  return tvl.minus(staking);
}

async function staking() {
  const metrics = await client.get("/metrics");
  return new BigNumber(metrics.data.hbb.staked).multipliedBy(metrics.data.hbb.price);
}

module.exports = {
  methodology: `To obtain the Hubble Protocol TVL we use the formula 'TVL = Total HBB Staked * Current HBB Price + Total Collateral Value + Total Stablecoin (USDH) in Stability Pool'.`,
  solana: {
    fetch: tvl,
  },
  staking: { fetch: staking },
  fetch: tvl
};