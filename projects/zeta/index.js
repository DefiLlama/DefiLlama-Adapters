const axios = require("axios");

async function tvl() {
  const tvlSnapshotResponse = await axios.get(
    "https://raw.githubusercontent.com/zetamarkets/statistics/main/tvl.json"
  );
  return tvlSnapshotResponse.data;
}

module.exports = {
  timetravel: false,
  methodology:
    "Snapshots of the TVL from Zeta FLEX (zeta.markets) are saved periodically into the statistics repo. Zeta DEX to be added soon",
  tvl,
};
