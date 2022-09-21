const axios = require("axios");

async function fetch() {
    const { data } = await axios.get("https://raw.githubusercontent.com/mean-dao/MEAN-stats/main/mean-stats.json");
    
    return data.tvl.total;
}

module.exports = {
    timetravel: false,
    methodology: "Snapshots of the TVL from app.meanfi.com are saved periodically into the statistics repo",
    fetch
}
