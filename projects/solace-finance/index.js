const retry = require("async-retry")
const axios = require("axios");

async function tvl(chain) {
  // github repository https://github.com/solace-fi/solace-stats
  var res = await retry(async bail => await axios.get(`https://stats.solace.fi/tvl?chain=${chain}`));
  var tvl = parseFloat(res["data"]["tvl_usd"]);
  return tvl;
}

module.exports = {
  ethereum: {
    tvl("mainnet")
  },
  bsc: {
    tvl("bsc")
  },
  aurora: {
    tvl("aurora")
  },
  polygon: {
    tvl("polygon")
  }
}
