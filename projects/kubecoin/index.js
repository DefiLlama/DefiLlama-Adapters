const { toUSDTBalances } = require("../helper/balances");
const { get } = require("../helper/http");

async function value() {
  const url = "https://api.kubepay.io/kubecoin/staking-usd/";
  return toUSDTBalances(await get(url));
}

module.exports = {
  cardano: {
    tvl: value,
    staking: value,
  },
};
