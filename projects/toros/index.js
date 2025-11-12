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
    [1674003600, "Optimism Incentives Start"],
    [1699050203, "Leverage Tokens on Optimism Release"],
    [1701468842, "First Arbitrum Vault Release"],
    [1706569200, "First Base Vault Release"],
    [1746628545, "First GMX Leveraged Tokens Release"],
    [1747632800, "Limit Orders Release"],
    [1750763200, "First 1X Leveraged Tokens Release"],
    [1753182400, "Protected Leveraged Tokens Using Options Release"],
    [1753335200, "Removal of Yield Products to Focus on Derivatives"],
    [1754392480, "First Ethereum Mainnet Leveraged Tokens Released"],
  ],
};
