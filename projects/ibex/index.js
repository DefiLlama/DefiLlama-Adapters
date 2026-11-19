const { get } = require("../helper/http");

const API_BASE = "https://api.cctools.network/api/markets/ibex";

async function tvl(api) {
  const feed = await get(`${API_BASE}/tvl`);
  if (!Array.isArray(feed?.assets) || !feed.assets.length)
    throw new Error("ibex: CCTools feed returned no assets");
  if (feed.amountsAreScaled !== true)
    throw new Error("ibex: CCTools feed amounts are not scaled");

  for (const asset of feed.assets) {
    if (!asset.coingeckoId)
      throw new Error(`ibex: no coingecko id for ${asset.symbol}`);
    const amount = Number(asset.amount);
    if (!Number.isFinite(amount) || amount < 0)
      throw new Error(`ibex: invalid amount for ${asset.symbol}`);
    // Amounts are already decimal-adjusted token units; pricing is left to DefiLlama.
    api.addCGToken(asset.coingeckoId, amount);
  }
}

module.exports = {
  timetravel: false,
  canton: { tvl },
  methodology:
    "TVL is the total value of assets deposited into Ibex Market vaults on Canton Network, sourced via CCTools which republishes Ibex's own API.",
};
