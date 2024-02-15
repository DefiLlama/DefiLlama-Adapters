const { get } = require("../helper/http");
const { toUSDTBalances } = require("../helper/balances");

module.exports = {
  misrepresentedTokens: true,
  icp: { tvl }
};

async function tvl() {
  let tvl = 0;
  let tvls = await get("https://gwhbq-7aaaa-aaaar-qabya-cai.raw.icp0.io/v1/pools/tvls");
  if (tvls && tvls.pairs && tvls.pairs.length) {
    tvl = tvls.pairs.reduce((a, item) => a + Number(item.tvl), 0);
  }
  return toUSDTBalances(tvl);
}
