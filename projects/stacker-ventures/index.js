const utils = require("../helper/utils");

/* * * * * * * *
 * ==> Correct adapter needs to be created.
 *
 *****************/

async function fetch() {
  let res = await utils.fetchURL("https://api.stacker.vc/stats");
  if (res && res.data) {
    const { farmingTreasuries, maticStats } = res.data;
    const tvl =
      Number(farmingTreasuries.ETH.totalDepositedUSD) +
      Number(farmingTreasuries.USDC.totalDepositedUSD) +
      Number(farmingTreasuries.WBTC.totalDepositedUSD) +
      Number(maticStats.farmingTreasuries.USDC.totalDepositedUSD);
    return tvl;
  }
  return 0;
}

module.exports = {
  fetch,
};
