const { getTokenSupplies } = require("../helper/solana");

const USX = "6FrrzDk5mQARGc1TDYoyVnSyRdds1t4PbtohCD6p3tgG";

async function tvl(api) {
  await getTokenSupplies([USX], { api });
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  methodology: "Total USX stablecoin supply value in USD",
  solana: {
    tvl,
  },
};