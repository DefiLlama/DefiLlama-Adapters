const axios = require("axios");

async function tvl() {
  let tvlSnapshotResponse = await axios.get(
    "https://raw.githubusercontent.com/Katana-Labs/statistics/master/tvl/tvl.json"
  );

  delete tvlSnapshotResponse.data[undefined]
  return tvlSnapshotResponse.data;
}

module.exports = {
  timetravel: false,
  methodology: "Snapshots of the TVL from app.katana.so are saved periodically into the statistics repo",
  solana: {
    tvl,  
  }
};