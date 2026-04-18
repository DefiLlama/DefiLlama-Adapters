const { DHEDGE_FACTORY_ABI, TOROS_POOL_ABI } = require("./abis");
const { CONFIG_DATA } = require("./config");

async function tvl(api) {
  const { chain, } = api
  const { dhedgeFactory, torosMultisigManager } = CONFIG_DATA[chain];

  const pools = await api.call({
    abi: DHEDGE_FACTORY_ABI,
    target: dhedgeFactory,
    params: [torosMultisigManager],
  });

  const poolSummariesRes = await api.multiCall({
    abi: TOROS_POOL_ABI,
    calls: pools,
    permitFailure: true
  });

  const poolSummaries = poolSummariesRes.filter(i => i && i.totalFundValue !== null && i.totalFundValue !== undefined);

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
  start: '2021-08-01', // Sunday, August 1, 2021 12:00:00 AM
  methodology:
    "Aggregates total value of each Toros vault on Polygon, Optimism, Arbitrum, Base and Ethereum",
  polygon: {
    tvl,
  },
  optimism: {
    tvl,
  },
  arbitrum: {
    tvl,
  },
  base: {
    tvl,
  },
  ethereum: {
    tvl,
  },
  hallmarks: [
    ['2023-01-18', "Optimism Incentives Start"],
    ['2023-11-03', "Leverage Tokens on Optimism Release"],
    ['2023-12-01', "First Arbitrum Vault Release"],
    ['2024-01-29', "First Base Vault Release"],
    ['2025-05-07', "First GMX Leveraged Tokens Release"],
    ['2025-05-19', "Limit Orders Release"],
    ['2025-06-24', "First 1X Leveraged Tokens Release"],
    ['2025-07-22', "Protected Leveraged Tokens Using Options Release"],
    ['2025-07-24', "Removal of Yield Products to Focus on Derivatives"],
    ['2025-08-05', "First Ethereum Mainnet Leveraged Tokens Released"],
  ],
};
