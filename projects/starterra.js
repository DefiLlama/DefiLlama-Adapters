const retry = require("./helper/retry");
const axios = require("axios");

async function pool2() {
  var res = await retry(
    async () =>
      await axios.get("https://api.starterra.io/cmc?q=tvl&onlyPool=true")
  );

  return parseFloat(res.data);
}

async function fetch() {
  var res = await retry(
    async () => await axios.get("https://api.starterra.io/cmc?q=tvl")
  );

  return parseFloat(res.data) - (await pool2());
}

module.exports = {
  fetch,
  pool2,
};
