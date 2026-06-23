const DHEDGE_FACTORY_ABI =
  "function getManagedPools(address manager) view returns (address[] managedPools)";

const TOROS_POOL_ABI =
  "function getFundSummary() view returns (tuple(string name, uint256 totalSupply, uint256 totalFundValue))";
const CONFIG_DATA = {
  polygon: {
    dhedgeFactory: "0xfdc7b8bFe0DD3513Cc669bB8d601Cb83e2F69cB0",
    torosMultisigManager: "0x090e7fbd87a673ee3d0b6ccacf0e1d94fb90da59",
  },
  optimism: {
    dhedgeFactory: "0x5e61a079A178f0E5784107a4963baAe0c5a680c6",
    torosMultisigManager: "0x813123a13d01d3f07d434673fdc89cbba523f14d",
  },
  arbitrum: {
    dhedgeFactory: "0xffFb5fB14606EB3a548C113026355020dDF27535",
    torosMultisigManager: "0xfbd2b4216f422dc1eee1cff4fb64b726f099def5",
  },
  base: {
    dhedgeFactory: "0x49Afe3abCf66CF09Fab86cb1139D8811C8afe56F",
    torosMultisigManager: "0x5619AD05b0253a7e647Bd2E4C01c7f40CEaB0879",
  },
  ethereum: {
    dhedgeFactory: "0x96d33bcf84dde326014248e2896f79bbb9c13d6d",
    torosMultisigManager: "0xfbd2b4216f422dc1eee1cff4fb64b726f099def5",
  },
  hyperliquid: {
    dhedgeFactory: "0x615037c2df6fa97634c5ad2d8144708b9dd3b176",
    torosMultisigManager: "0xfbd2b4216f422dc1eee1cff4fb64b726f099def5",
  },
};

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
    "Aggregates total value of each Toros vault on Polygon, Optimism, Arbitrum, Base, Ethereum and Hyperliquid",
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
  hyperliquid: {
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
