const axios = require("axios");

async function iotex() {
  const tvl = await axios.get("https://api.dddx.io/api/v1/tvl");
  return Number(tvl.data);
}

module.exports = {
  timetravel: false,
  iotex: {
    fetch: iotex,
  },
  fetch: iotex
};
