const retry = require("async-retry");
const axios = require("axios");
async function fetch() {
  let tvl_feed = await retry(
    async (bail) => await axios.get("https://bnpl-pay.herokuapp.com/tvl")
  );
  let tvl = Number(tvl_feed.data.tvl);
  return tvl;
}

module.exports = {
  fetch,
};
