// Uses AFX's public DefiLlama integration endpoint for LP Vault TVL.
const { get } = require("../helper/http");

const API_URL = "https://api.afx.xyz/info/integrations/defillama/lp/summary";

async function tvl(api) {
  const response = await get(API_URL, {
    headers: {
      Accept: "application/json",
      "User-Agent": "defillama-tvl-adapters/1.0",
    },
  }); 
  const tvlUsd = Number(response?.data?.summary?.tvl);
  if (!Number.isFinite(tvlUsd)) {
    throw new Error("Invalid AFX LP TVL response");
  }
  api.addUSDValue(tvlUsd);
}

module.exports = {
  methodology: "TVL is the current USD value locked in the AFX LP Vault, as reported by AFX's public DefiLlama integration API.",
  afx: { tvl },  
};