const axios = require("axios");

async function bscx() {
  const tvl = await axios.get("https://api.dddx.io/api/v1/tvl");
  return Number(tvl.data);
}

module.exports = {
  timetravel: false,
  bsc: {
    fetch: bscx,
  },
  fetch: bscx
};
