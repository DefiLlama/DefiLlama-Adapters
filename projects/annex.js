const axios = require("axios");

async function bsc() {
  const [lending, pools] = await Promise.all([
    axios.get("https://api.annex.finance/api/v1/governance/annex"),
    axios.get("https://api.annex.finance/api/v1/pools"),
  ]);
  return (
    lending.data.data.markets.reduce(
      (total, market) => total + Number(market.liquidity),
      0
    ) +
    pools.data.pairs.reduce(
      (total, market) => total + Number(market.liquidity),
      0
    )
  );
}
// https://api.annex.finance/api/v1/pools
async function cronos() {
  const [lending, pools] = await Promise.all([
    axios.get("https://cronosapi.annex.finance/api/v1/governance/annex"),
    axios.get("https://cronosapi.annex.finance/api/v1/pools"),
  ]);
  return (
    lending.data.data.markets.reduce(
      (total, market) => total + Number(market.liquidity),
      0
    ) +
    pools.data.pairs.reduce(
      (total, market) => total + Number(market.liquidity),
      0
    )
  );
}

module.exports = {
  methodology:
    'TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL. Data is pull from the Annex API "https://api.annex.finance/api/v1/governance/annex".',
  bsc: {
    fetch: bsc,
  },
  cronos: {
    fetch: cronos,
  },
  fetch: async () => (await bsc()) + (await cronos()),
};
