const { get } = require("../helper/http");
const { getEnv } = require("../helper/env");

// Endpoint implementation: https://github.com/aptos-labs/etna/pull/6093
const DAILY_STATS_URL = "https://api.mainnet.aptoslabs.com/decibel/api/v1/daily_stats";

async function tvl(api) {
  const apiKey = getEnv("APTOS_API_KEY");
  if (!apiKey) throw new Error("Decibel TVL requires APTOS_API_KEY");
  const endTimestamp = Math.floor(Date.now() / 1000);
  const { tvl: snapshot } = await get(`${DAILY_STATS_URL}?start_timestamp=${endTimestamp - 86400}&end_timestamp=${endTimestamp}&include_tvl=true`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!Array.isArray(snapshot?.protocols) || !Number.isSafeInteger(snapshot.timestamp_ms)
    || snapshot.timestamp_ms >= endTimestamp * 1000
    || endTimestamp * 1000 - snapshot.timestamp_ms > 60000)
    throw new Error("Decibel daily_stats is missing a fresh TVL snapshot");

  const data = snapshot.protocols.find(i => i?.protocol === "Decibel Perps DEX");
  const tokens = data?.tokens?.filter(i => i.token === "APT" || i.token === "USDC");
  if (tokens?.length !== 2 || new Set(tokens.map(i => i.token)).size !== 2)
    throw new Error("Decibel daily_stats is missing APT or native USDC TVL");

  tokens.forEach(i => {
    const value = Number(i.usdc_value);
    if (typeof i.usdc_value !== "string" || !/^\d+(\.\d+)?$/.test(i.usdc_value) || !Number.isFinite(value))
      throw new Error("Decibel daily_stats contains an invalid USDC valuation");
    api.addCGToken("usd-coin", value);
  });
}

module.exports = {
  methodology: "TVL is APT collateral valued using Decibel's oracle plus native USDC collateral, reported in USDC.",
  misrepresentedTokens: true,
  timetravel: false,
  aptos: { tvl },
};
