const BigNumber = require("bignumber.js");
const ADDRESSES = require("../helper/coreAssets.json");
const { get } = require("../helper/http");
const { getEnv } = require("../helper/env");

// Custody is measured from Aptos stores at one completed indexer checkpoint.
// Endpoint implementation: https://github.com/aptos-labs/etna/pull/6093
const DAILY_STATS_URL = "https://api.mainnet.aptoslabs.com/decibel/api/v1/daily_stats";

// Native APT uses paired fungible-asset metadata 0xa.
const INCLUDED_ASSETS = new Set(["0xa", ADDRESSES.aptos.USDC_3].map(address => BigInt(address).toString(16)));

async function tvl(api) {
  const apiKey = getEnv("APTOS_API_KEY");
  if (!apiKey) throw new Error("Decibel TVL requires APTOS_API_KEY");
  const endTimestamp = Math.floor(Date.now() / 1000);
  const { tvl: snapshot } = await get(`${DAILY_STATS_URL}?start_timestamp=${endTimestamp - 86400}&end_timestamp=${endTimestamp}&include_tvl=true`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!snapshot || !Array.isArray(snapshot.assets) || !snapshot.assets.length
    || typeof snapshot.ledger_version !== "string" || !/^\d+$/.test(snapshot.ledger_version)
    || !Number.isSafeInteger(snapshot.timestamp_ms)
    || snapshot.timestamp_ms >= endTimestamp * 1000
    || endTimestamp * 1000 - snapshot.timestamp_ms > 60000)
    throw new Error("Decibel daily_stats is missing a fresh TVL snapshot");

  const seen = new Set();
  for (const asset of snapshot.assets) {
    if (typeof asset.asset_addr !== "string" || !/^0x[0-9a-fA-F]{1,64}$/.test(asset.asset_addr))
      throw new Error("Decibel daily_stats contains an invalid TVL asset address");
    const address = BigInt(asset.asset_addr).toString(16);
    if (!INCLUDED_ASSETS.has(address)) continue;
    if (typeof asset.price_id !== "string" || !/^(aptos|coingecko):\S+$/.test(asset.price_id)
      || !Number.isInteger(asset.decimals) || asset.decimals < 0 || asset.decimals > 255
      || typeof asset.total_balance !== "string" || !/^\d+$/.test(asset.total_balance))
      throw new Error("Decibel daily_stats contains an invalid TVL asset");
    if (seen.has(address)) throw new Error("Decibel daily_stats contains a duplicate TVL asset");
    seen.add(address);

    // CoinGecko keys take whole-token amounts; Aptos keys take raw token units.
    const balance = asset.price_id.startsWith("coingecko:")
      ? new BigNumber(asset.total_balance).shiftedBy(-asset.decimals).toNumber()
      : asset.total_balance;
    api.add(asset.price_id, balance, { skipChain: true });
  }
  if (seen.size !== INCLUDED_ASSETS.size)
    throw new Error("Decibel daily_stats is missing APT or native USDC TVL");
}

module.exports = {
  methodology: "TVL is native APT and native USDC collateral deposited to Decibel, measured at one completed Aptos ledger checkpoint and priced by DefiLlama.",
  timetravel: false,
  aptos: { tvl },
};
