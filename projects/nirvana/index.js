const axios = require("axios");
const NIRVANA_API = "https://us-central1-nirvana-91051.cloudfunctions.net";
const { toUSDTBalances } = require("../helper/balances");

const client = axios.create({
  baseURL: NIRVANA_API,
});

async function staking() {
  const metrics = await client.get("/getLlama");
  const { tvl } = metrics.data;
  return toUSDTBalances(tvl);
}

module.exports = {
  timetravel: false,
  methodology:
    "The total value of ANA tokens locked in the protocol, either as staking or as collateral for loans.",
  solana: {
    tvl: () => ({}),
    staking,
  },
};
