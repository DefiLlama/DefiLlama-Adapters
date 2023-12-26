const { get } = require("../helper/http");
const { toUSDTBalances } = require("../helper/balances");

const swopfiBackendEndpoint = "https://backend.swop.fi";

const getSwopFiTVL = async () => {
  const poolsStats = await get(`${swopfiBackendEndpoint}/pools`);
  return toUSDTBalances(poolsStats.overall.liquidity);
}

module.exports = {
  timetravel: false, // Waves blockchain,
  methodology: "Counts the tokens locked on AMM pools",
  waves: {
    tvl: getSwopFiTVL,
  }
};
