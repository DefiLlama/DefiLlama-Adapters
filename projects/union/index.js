const utils = require("../helper/utils");

async function fetch() {
  const dataPools = (await utils.fetchURL("https://c-op-api.unn.finance/v1/pools")).data.pools;
  let tvl = 0;
  for (const liq of dataPools) {
    tvl += parseFloat(liq.liquidity)
  }
  return tvl;
}

module.exports = {
  fetch,
};
