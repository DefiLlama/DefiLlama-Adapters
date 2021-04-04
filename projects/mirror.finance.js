const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
  return await axios.get("https://graph.mirror.finance/graphql?query={statistic{totalValueLocked}}")
    .then(response => new BigNumber(response.data.data.statistic.totalValueLocked).div(10 ** 6).toFixed(2))
    .catch(exception => {
      console.log("Failed to fetch mirror.finance TVL, error: " + exception);

      return 0;
    });
}

module.exports = {
  fetch
}
