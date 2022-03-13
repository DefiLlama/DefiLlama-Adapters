const axios = require("axios");
const HUBBLE_API = "https://api.hubbleprotocol.io";

const client = axios.create({
  baseURL: HUBBLE_API,
});

async function tvl() {
  const metrics = await client.get("/metrics");
  return metrics.data.totalValueLocked - metrics.data.hbb.staked * metrics.data.hbb.price;
}

async function staking() {
  const metrics = await client.get("/metrics");
  return metrics.data.hbb.staked * metrics.data.hbb.price;
}

module.exports = {
  methodology: `To obtain the Hubble Protocol TVL we use the formula 'TVL = Total HBB Staked * Current HBB Price + Total Collateral Value + Total Stablecoin (USDH) in Stability Pool'.`,
  solana: {
    fetch: tvl,
  },
  staking: { fetch: staking },
  fetch: tvl
};