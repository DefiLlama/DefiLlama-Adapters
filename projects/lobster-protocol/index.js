const { DHEDGE_FACTORY_ABI, LOBSTER_POOL_ABI } = require("./abis");
const { CONFIG_DATA } = require("./config");

async function tvl(api) {
  const { chain, } = api
  const { dhedgeFactory, lobsterManager } = CONFIG_DATA[chain];

  const pools = await api.call({
    abi: DHEDGE_FACTORY_ABI,
    target: dhedgeFactory,
    params: [lobsterManager],
  });

  const poolSummaries = await api.multiCall({
    abi: LOBSTER_POOL_ABI,
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
  misrepresentedTokens: true,
  start: 1704067199, // Sunday 31 December 2023 23:59:59
  methodology:
    "Aggregates total value of Lobster protocol vaults on Arbitrum",
  arbitrum: {
    tvl,
  },
  hallmarks: [
    [171097151, "First Arbitrum Vault Release"],
  ],
};
