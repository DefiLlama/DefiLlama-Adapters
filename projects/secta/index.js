// This adaptor uses a wrapper around Secta Finance's Subgraphs.
//
// The wrapper can be found at:
// https://gitlab.com/secta-finance/secta-frontend
//
// It calls:
// https://github.com/secta-finance/secta-subgraph
// (both v2/v3 exchanges, summing for total TVL)

const axios = require("axios");

async function tvl(timestamp) {
  const { data } = await axios.get(
    `https://www.secta.finance/api/stats/summary`
  );

  const tvlValue = Number(data.data.totalValueLockedUSD);

  return {
    usd: tvlValue,
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "Queries a wrapper around subgraphs on linea, summing the V2/V3 exchanges on secta finance and returning total USD TVL.",
  start: 1708560000,
  linea: { tvl },
};
