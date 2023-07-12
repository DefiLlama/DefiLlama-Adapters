const { toUSDTBalances } = require("../helper/balances");
const { sumTokens } = require("../helper/chain/elrond");
const { get } = require("../helper/http");

const API_URL = "https://api-nfts.jewelswap.io/tvl";

async function tvl() {
  const data = await get(API_URL);
  return toUSDTBalances(data);
}

const LENDING_POOL = 'erd1qqqqqqqqqqqqqpgqhpauarfmx75nf4pwxh2fuy520ym03p8e8jcqt466up'
const LENDING_POOL_FARMS = 'erd1qqqqqqqqqqqqqpgq96n4gxvmw8nxgxud8nv8qmms5namspc5vmusg930sh'
const FARMS = 'erd1qqqqqqqqqqqqqpgqlnxy2hmvs8qxr6ezq2wmggn7ev62cjp6vmusvdral4'
async function tvl1(_, _b, _cb, { api, }) {
  return sumTokens({ owners: [LENDING_POOL, LENDING_POOL_FARMS, FARMS]})
  
}
module.exports = {
  timetravel: false,
  elrond: {
    tvl: tvl1,
  },
};
