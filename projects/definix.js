const retry = require("./helper/retry");
const axios = require("axios");

async function klaytn() {
  const response = await retry(
    async (bail) =>
      await axios.get(
        "https://database-s3public-g8ignhbbbk6e.s3.ap-southeast-1.amazonaws.com/definix/tvl.json"
      )
  );
  return response.data.caverTVL;
}
async function bsc() {
  const response = await retry(
    async (bail) =>
      await axios.get(
        "https://database-s3public-g8ignhbbbk6e.s3.ap-southeast-1.amazonaws.com/definix/tvl.json"
      )
  );
  return response.data.web3TVL;
}
module.exports = {
  klaytn: {
    fetch: klaytn,
  },
  bsc: {
    fetch: bsc,
  },
  fetch: async () => (await bsc()) + (await klaytn()),
};
// node test.js projects/definix.js
