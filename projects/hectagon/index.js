const retry = require("async-retry");
const axios = require("axios");

async function fetch() {
  const data = await retry(
    async (bail) =>
      await axios
        .get("https://app.hectagon.finance/api/metric/tvl")
        .then((response) => response.data)
  );
  return parseFloat(data.tvl);
}

module.exports = {
  fetch,
};
