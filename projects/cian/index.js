const { get } = require("../helper/http");
const { toUSDTBalances } = require("../helper/balances");

async function fetchEthereum() {
  const value = await get("https://data.cian.app/ethereum/api/v1/tvl");

  return toUSDTBalances(value);
}

async function fetchAvax() {
  const value = await get("https://data.cian.app/tvl");

  return toUSDTBalances(value);
}

async function fetchPolygon() {
  const value = await get("https://data.cian.app/polygon/api/v1/tvl");

  return toUSDTBalances(value);
}

async function fetchArbitrum() {
  const value = await get("https://data.cian.app/arbitrum/api/v1/tvl");

  return toUSDTBalances(value);
}

async function fetchOptimism() {
  const value = await get("https://data.cian.app/optimism/api/v1/tvl");

  return toUSDTBalances(value);
}


module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  timetravel: false,
  avax: {
    tvl: fetchAvax,
  },
  polygon: {
    tvl: fetchPolygon,
  },
  ethereum: {
    tvl: fetchEthereum,
  },
  arbitrum: {
    tvl: fetchArbitrum,
  },
  optimism: {
    tvl: fetchOptimism,
  },
};
