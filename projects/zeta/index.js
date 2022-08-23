const axios = require("axios");

async function tvl() {
  const tvlSnapshotResponse = await axios.get(
    "https://raw.githubusercontent.com/zetamarkets/statistics/main/tvl.json"
  );
  return tvlSnapshotResponse.data;
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  methodology:
    "Snapshots of the TVL from Zeta (zeta.markets) are saved periodically into the statistics repo. This includes all tokens used as collateral and in the insurance fund",
  solana: {
    tvl,
  },
};
