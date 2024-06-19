const { config } = require("./config");
const { getLogs } = require("../../helper/cache/getLogs");

module.exports = {};

Object.keys(config).map((network) => {
  const { tranche_factory } = config[network];
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

      // fetch adapter contracts
      const results = await api.multiCall({
        abi: "function getSeries() external view returns (tuple(address underlying, address target, address yt, address adapter, uint256 mscale, uint256 maxscale, uint64 issuanceFee, uint64 maturity))",
        calls: tranches,
      });
      const adapters = results.map((r) => r.adapter);
      const underlyingTokens = results.map((r) => r.underlying);

      // fetch underlying balances of adapter contracts
      const fetchedbalances = await api.multiCall({
        abi: "erc20:balanceOf",
        calls: adapters.map((adapter, i) => {
          return {
            target: underlyingTokens[i],
            params: adapter,
          }
        }),
      })

      // sum up the balances
      fetchedbalances.forEach((balance, i) => {
        api.add(underlyingTokens[i], balance)
      })
    },
  };
});
