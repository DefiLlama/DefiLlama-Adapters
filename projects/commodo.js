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
    url: "https://stat.comdex.one/api/v2/commodo/total/lb",
  })
  .then((response) => {
    totalTvl = response.data.data.total_deposit
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

//   on chain api's used in this process :-
//  https://rest.comdex.one/comdex/lend/v1beta1/pools
//  https://rest.comdex.one/comdex/lend/v1beta1/pool_asset_lb_mapping/{asset_id}/{pool_id}
//  total_lend give the valueLocked(not $value) of that particular asset under the pool.