const DHEDGE_FACTORY_ABI = "function getManagedPools(address manager) view returns (address[] managedPools)";
const LOBSTER_POOL_ABI = "function getFundSummary() view returns (tuple(string name, uint256 totalSupply, uint256 totalFundValue))";

const CONFIG_DATA = {
  arbitrum: {
    dhedgeFactory: "0xffFb5fB14606EB3a548C113026355020dDF27535",
    lobsterManager: "0x6EBb1B5Be9bc93858f71714eD03f67BF237473cB",
  }
}

async function tvl(api) {
  const { dhedgeFactory, lobsterManager } = CONFIG_DATA[api.chain];

  const pools = await api.call({ abi: DHEDGE_FACTORY_ABI, target: dhedgeFactory, params: lobsterManager, });
  const poolSummaries = await api.multiCall({ abi: LOBSTER_POOL_ABI, calls: pools, })
  api.addCGToken('tether', poolSummaries.reduce((acc, p) => acc + +p.totalFundValue/1e18, 0))
}

module.exports = {
  misrepresentedTokens: true,
  start: '2024-01-01', // Sunday 31 December 2023 23:59:59
  methodology:
    "Aggregates total value of Lobster protocol vaults on Arbitrum",
  arbitrum: {
    tvl,
  },
  hallmarks: [
    [1710971510, "First Arbitrum Vault Release"],
  ],
}