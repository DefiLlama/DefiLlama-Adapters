const { config } = require("./config");
const { getLogs } = require("../../helper/cache/getLogs");

module.exports = {};

Object.keys(config).map((network) => {
  const { tranche_factory, pool_factory } = config[network];
  module.exports[network] = {
    tvl: async (api) => {
      const trancheDeployedLogs = tranche_factory.address
        ? await getLogs({
          api,
          target: tranche_factory.address,
          topic: "TrancheDeployed(uint256,address,address)",
          eventAbi:
            "event TrancheDeployed(uint256 indexed maturity, address indexed principalToken, address indexed yieldToken)",
          onlyArgs: true,
          fromBlock: tranche_factory.deployedAt,
        })
        : [];

      const tranches = trancheDeployedLogs.map((event) =>
        event.principalToken.toLowerCase()
      );

      // fetch deployed pools
      const poolDeployedLogs = pool_factory.address
        ? await getLogs({
          api,
          target: pool_factory.address,
          topic: "Deployed(address,address,address)",
          eventAbi:
            "event Deployed(uint256 indexed basePool, address indexed underlying, address indexed pool)",
          onlyArgs: true,
          fromBlock: pool_factory.deployedAt,
        })
        : [];

      const pools = poolDeployedLogs.map((event) => event.pool.toLowerCase())

      // fetch adapter contracts
      const results = await api.multiCall({
        abi: "function getSeries() external view returns (tuple(address underlying, address target, address yt, address adapter, uint256 mscale, uint256 maxscale, uint64 issuanceFee, uint64 maturity))",
        calls: tranches,
      });
      const adapters = results.map((r) => r.adapter);
      const underlyingTokens = results.map((r) => r.underlying);

      // fetch underlying balances of adapters and pools
      const [adapterBalances, poolBalances, poolUnderlyings] = await Promise.all([
        api.multiCall({
          abi: "function totalAssets() external view returns (uint256 totalManaged)",
          calls: adapters
        }),
        api.multiCall({
          abi: "function totalUnderlying() external view returns (uint128 totalUnderlyings)",
          calls: pools
        }),
        api.multiCall({
          abi: "function underlying() external view returns (address underlyingAddress)",
          calls: pools
        })
      ])

      // sum up the balances
      adapterBalances.forEach((totalManaged, i) => {
        api.add(underlyingTokens[i], totalManaged)
      })
      pools.forEach((_pool, i) => {
        api.add(poolUnderlyings[i], poolBalances[i])
      })
    },
  };
});
