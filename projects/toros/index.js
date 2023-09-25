const { DHEDGE_FACTORY_ABI, TOROS_POOL_ABI } = require("./abis");
const { CONFIG_DATA } = require("./config");

async function tvl(_, _b, _cb, { api, chain }) {
  const { dhedgeFactory, torosMultisigManager } = CONFIG_DATA[chain];

  const pools = await api.call({
    abi: DHEDGE_FACTORY_ABI,
    target: dhedgeFactory,
    params: [torosMultisigManager],
  });

  const poolSummaries = await api.multiCall({
    abi: TOROS_POOL_ABI,
    calls: pools,
  });

  const totalValue = poolSummaries.reduce(
    (acc, i) => acc + +i.totalFundValue,
    0
  );

  return {
    tether: totalValue / 1e18,
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  start: 1627776000, // Sunday, August 1, 2021 12:00:00 AM
  methodology:
    "Aggregates total value of each Toros vault both on Polygon and Optimism",
  polygon: {
    tvl,
  },
  optimism: {
    tvl,
  },
  hallmarks: [[1674003600, "Optimism Incentives Start"]],
};
