const retry = require("async-retry")
const axios = require("axios");


async function fetch() {
  // github repository https://github.com/solace-fi/solace-stats/tree/main/api/tvl
  var res = await retry(async bail => await axios.get(`https://stats.solace.fi/tvl`));
  var tvl = parseFloat(res["data"]["tvl_usd"]);
  return tvl;
}

module.exports = {
  ethereum: {
    fetch: async () => {
        // github repository https://github.com/solace-fi/solace-stats/tree/main/api/tvl
        var res = await retry(async bail => await axios.get(`https://stats.solace.fi/tvl?chain=mainnet`));
        var tvl = parseFloat(res["data"]["tvl_usd"]);
        return tvl;
    }
  },
  bsc: {
    fetch: async () => {
      // github repository https://github.com/solace-fi/solace-stats/tree/main/api/tvl
      var res = await retry(async bail => await axios.get(`https://stats.solace.fi/tvl?chain=bsc`));
      var tvl = parseFloat(res["data"]["tvl_usd"]);
      return tvl;
    }
  },
  aurora: {
    fetch: async () => {
      // github repository https://github.com/solace-fi/solace-stats/tree/main/api/tvl
      var res = await retry(async bail => await axios.get(`https://stats.solace.fi/tvl?chain=aurora`));
      var tvl = parseFloat(res["data"]["tvl_usd"]);
      return tvl;
    }
  },
  polygon: {
    fetch: async () => {
      // github repository https://github.com/solace-fi/solace-stats/tree/main/api/tvl
      var res = await retry(async bail => await axios.get(`https://stats.solace.fi/tvl?chain=polygon`));
      var tvl = parseFloat(res["data"]["tvl_usd"]);
      return tvl;
    }
  },
  fetch
}
