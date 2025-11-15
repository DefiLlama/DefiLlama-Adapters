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
  methodology: `
The methodology for calculating TVL includes both the TON balance and tokens' balances
data for each pool. The calculation is performed on the Parraton API side.
  `.trim(),

  ton: {
    tvl,
  },
};
