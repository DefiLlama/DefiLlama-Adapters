const { get } = require("../helper/http");

const API_BASE = "https://api.cctools.network/api/markets/ibex";

async function tvl(api) {
  const data = await get(`${API_BASE}/tvl`);
  for (const asset of data.assets) {
    api.addCGToken(asset.coingeckoId, asset.amount * asset.priceUsd);
  }
}

module.exports = {
  canton: { tvl },
  methodology:
    "TVL is the total value of assets deposited into Ibex Market vaults on Canton Network, sourced via CCTools which republishes Ibex's own API.",
};
