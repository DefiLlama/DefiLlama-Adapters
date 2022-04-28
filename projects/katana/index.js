const axios = require("axios");

async function tvl() {
  const tvlSnapshotResponse = await axios.get(
    "https://raw.githubusercontent.com/Katana-Labs/statistics/master/tvl/tvl.json"
  );

  return tvlSnapshotResponse.data;
}

module.exports = {
  timetravel: false,
  methodology: "Snapshots of the TVL from app.katana.so are saved periodically into the statistics repo",
  solana: {
    tvl,  
  }
};
// node test.js projects/katana/index.js
