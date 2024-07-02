
const { getLogs } = require("../helper/cache/getLogs");

// https://docs.napier.finance/contract-and-integrations/deployed-contracts
const config = {
  ethereum: {
    pool_factory: {
      address: "0x17354e8e7518599c7f6B7095a6706766e4e4dC61",
      deployedAt: 20017932,
    },
    tranche_factory: {
      address: "0x83CE9e95118b48DfED91632e1bB848f1D4ee12e3",
      deployedAt: 20017932,
    },
  },
}

Object.keys(config).map((network) => {
  const { tranche_factory, pool_factory } = config[network];
  module.exports[network] = {
    tvl: async (api) => {
      const trancheDeployedLogs = tranche_factory.address ? await getLogs({
        api,
        target: tranche_factory.address,
        eventAbi:
          "event TrancheDeployed(uint256 indexed maturity, address indexed principalToken, address indexed yieldToken)",
        onlyArgs: true,
        fromBlock: tranche_factory.deployedAt,
      }) : [];

      const tranches = trancheDeployedLogs.map((event) => event.principalToken);

      // fetch deployed pools
      const poolDeployedLogs = pool_factory.address ? await getLogs({
        api,
        target: pool_factory.address,
        eventAbi: "event Deployed(uint256 indexed basePool, address indexed underlying, address indexed pool)",
        onlyArgs: true,
        fromBlock: pool_factory.deployedAt,
      }) : [];

      const pools = poolDeployedLogs.map((event) => event.pool)

      // fetch adapter contracts
      const results = await api.multiCall({
        abi: "function getSeries() external view returns (tuple(address underlying, address target, address yt, address adapter, uint256 mscale, uint256 maxscale, uint64 issuanceFee, uint64 maturity))",
        calls: tranches,
      });
      const adapters = results.map((r) => r.adapter);
      const underlyingTokens = results.map((r) => r.underlying);
      const adapterBalances = await api.multiCall({  abi: 'uint256:totalAssets', calls: adapters})
      api.add(underlyingTokens, adapterBalances)
      console.log({ pools, adapters, tranches})
      return api.erc4626Sum({ calls: pools, tokensAbi: 'underlying', balanceAbi: 'totalUnderlying'})
    },
  };
});
