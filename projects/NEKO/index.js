const { call } = require("../helper/chain/near")

async function tvl(api) {
  const NEKOStakedInFactory = await call("cookie.nekotoken.near", "get_total_staked", {});
  api.add('coingecko:neko', NEKOStakedInFactory / 1e24, { skipChain: true, })
}

module.exports = {
  near: {
    tvl: () => ({}),
    staking: tvl,
  },
  timetravel: false,
  methodology: "Count the total value staked in the factory",
};
