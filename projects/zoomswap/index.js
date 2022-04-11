const axios = require("axios");

async function iotex() {
  const tvl = await axios.get("https://service.zoomswap.io/tvl");
  return Number(tvl.data);
}

module.exports = {
  timetravel: false,
  iotex: {
    fetch: iotex,
  },
  fetch: iotex
};
