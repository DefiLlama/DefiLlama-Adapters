const { default: axios } = require("axios");
const { toUSDTBalances } = require("../helper/balances");
const retry = require("../helper/retry");

const farmApi = "https://api.elision.farm/getFarmStats/harmony/artemis";

function tvl(pool2) {
  return async () => {
    let tvl = 0;
    let { data: farms } = await retry(async (bail) => await axios.get(farmApi));
    for (let i = 0; i < farms.length; i++) {
      if (farms[i].name.startsWith("MIS") || farms[i].name.endsWith("MIS")) {
        if(pool2){
          tvl += farms[i].farm_liquidity_usd;
        }
      } else {
        if(!pool2){
          tvl += farms[i].farm_liquidity_usd;
        }
      }
    }
    return toUSDTBalances(tvl);
  }
}

module.exports = {
  harmony: {
    pool2: tvl(true),
    tvl: tvl(false),
  }
};