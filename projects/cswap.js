const axios = require("axios");

let totalTvl = 0;
axios
  .request({
    headers: {
      Accept: "application/json, text/plain, */*",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    },
    method: "GET",
    url: "https://stat.comdex.one/api/v2/cswap/tokens/all",
  })
  .then((response) => {
    const arr = [...response.data.data];
    for (let i = 0; i < arr.length; i++) {
        totalTvl = totalTvl + arr[i].liquidity;
    }
  })
  .catch((error) => {
    console.log(error);
  });

  async function fetch() {
    return totalTvl
  }

  module.exports = {
    fetch
  }