const { get } = require("../helper/http");
const ADDRESSES = require("../helper/coreAssets.json");

async function tvl(api) {
  const pools = await get("https://backend.crouton.finance/pools");
  const tvl = pools.reduce((acc, pool) => {
    acc += Number(pool.tvlUsd);
    return acc;
  }, 0);
  api.add(ADDRESSES.ton.USDT, tvl * 1e6);
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: `Value of tokens in the pool`,
  deadFrom: '2025-06-27', // site down
  ton: {
    tvl,
  },
};
