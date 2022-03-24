const { SwapCanisterController } = require("@psychedelic/sonic-js");
const retry = require("async-retry");
const axios = require("axios");
const { toUSDTBalances } = require("../helper/balances");

poolIDs = [
  "aanaa-xaaaa-aaaah-aaeiq-cai", //XTC-WICP Pool
];

const anonymousController = new SwapCanisterController();

const fetchICPPrice = async () => {
  const res = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=internet-computer&vs_currencies=usd"
  );
  return res.data["internet-computer"].usd;
};

const fetch = async () => {
  var poolBalances = [];

  const poolList = await retry(
    async (bail) => await anonymousController.getPairList()
  );

  for (const pool in poolList) {
    if (poolIDs.includes(pool)) {
      let {
        ["token0"]: token0,
        ["token1"]: token1,
        ["reserve0"]: bigIntReserve0,
        ["reserve1"]: bigIntReserve1,
      } = Object.values(poolList[pool])[0];

      poolBalances.push({
        ["token0"]: token0,
        ["token1"]: token1,
        ["bigIntReserve0"]: bigIntReserve0,
        ["bigIntReserve1"]: bigIntReserve1,
      });
    }
  }

  /*
   * below should be updated once there is way to deal with decimals/prices of different tokens on ICP
   */

  const reserve0 = Number(poolBalances[0].bigIntReserve0) / 10 ** 12; // XTC token: 12 decimals
  const reserve1 = Number(poolBalances[0].bigIntReserve1) / 10 ** 8; // wrappedICP token: 8 decimals

  const ICPPrice = await fetchICPPrice();

  const XTCWICPPoolValue = 2 * reserve1 * ICPPrice; // XTC not yet on other DEXes, so value of pool taken to be twice ICP value

  const tvl = XTCWICPPoolValue;

  return toUSDTBalances(tvl);
};

module.exports = {
  misrepresentedTokens: true,
  timeTravel: false,
  methodology: "",
  "Internet Computer": {
    tvl: fetch,
  },
};
