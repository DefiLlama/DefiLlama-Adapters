const retry = require("./helper/retry");
const axios = require("axios");

async function fetch() {
  const stats = (
    await retry(async (bail) => await axios.get(
      "https://api.internal.instadapp.io/defi/api/stats/instadapp/overall?limit=1&offset=0"
      )
    )
  ).data.stats[0];

  return stats.totalSupplied;
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  ethereum: {
    fetch
  },
  fetch
}
// node test.js projects/instadapp.js