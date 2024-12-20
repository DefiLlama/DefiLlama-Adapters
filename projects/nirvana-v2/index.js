const axios = require("axios");
const NIRVANA_API =
  "https://json-api-prod-548644909672.us-west2.run.app/api/tenants/BcAoCEdkzV2J21gAjCCEokBw5iMnAe96SbYo9F6QmKWV";

const client = axios.create({
  baseURL: NIRVANA_API,
});

async function getMetrics() {
  try {
    const response = await client.get("/llama-stats");
    return {
      tvlUsd: Number(response.data.tvlUsd),
      anaStakedUsd: Number(response.data.anaStakedUsd),
    };
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return { tvlUsd: 0, anaStakedUsd: 0 };
  }
}

async function tvl() {
  const metrics = await getMetrics();
  return {
    "usd-coin": metrics.tvlUsd,
  };
}

async function staking() {
  const metrics = await getMetrics();
  return {
    "usd-coin": metrics.anaStakedUsd,
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL - The total value of the Nirvana v2 reserve.  Staking - The total value of ANA tokens locked in the protocol as staking or collateral.",
  solana: {
    tvl,
    staking,
  },
};
