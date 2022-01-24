const axios = require("axios");
const { default: BigNumber } = require("bignumber.js");

async function iotex() {
  const tvl = await axios.get("https://service.zoomswap.io/tvl");
  return tvl.data;
}

module.exports = {
  timetravel: true,
  iotex: {
    fetch: iotex,
  },
};
