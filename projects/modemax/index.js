const { graphQuery } = require("../helper/http");
const { toUSDTBalances } = require('../helper/balances');

const api = "https://api.goldsky.com/api/public/project_clyqktolulxs201q46av1eils/subgraphs/modemax-synthetics-stats/v0.0.1/gn";

const query = /* GraphQL */ `
  query volumeInfo {
    volumeInfos(where: { period: "total" }) {
      volumeUsd
    }
  }
`;
function formatUnits(value, decimals) {
  const factor = Math.pow(10, decimals);
  return (value / factor).toFixed(decimals); 
}
async function getTvl() {
  const results = await graphQuery(api, query);
  const tvl = results.volumeInfos[0].volumeUsd;
  return toUSDTBalances(formatUnits(tvl, 30));
}

module.exports = {
  mode: {
    tvl: getTvl
  }
}
