const axios = require("axios");

async function fetch() {
    const query = `
    {
      totalValueLocked(id: 1) {
        totalValueLockedUSD
      }
    }
  `;

    const options = {
      method: "post",
      url: "https://api.thegraph.com/subgraphs/name/growthdefi/growth-defi",
      data: {
        query,
      },
    };

    const response = await axios(options);

    const tvl = response.data.data.totalValueLocked.totalValueLockedUSD;

    return parseFloat(tvl);
}

module.exports = {
  fetch
}
