const axios = require("axios");

async function fetch() {
    const tvlSnapshotResponse = await axios.get(
        "https://raw.githubusercontent.com/mean-dao/MEAN-stats/main/mean-stats.json"
    );
    const { data } = tvlSnapshotResponse;
    return data.tvl.total;
}

module.exports = {
    timetravel: false,
    methodology: "Snapshots of the TVL from app.katana.so are saved periodically into the statistics repo",
    fetch
}
