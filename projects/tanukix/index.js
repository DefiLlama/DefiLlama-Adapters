const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require("../helper/cache/getLogs");

async function tvl(api) {
  const factories = config[api.chain];

  const poolData = await Promise.all(factories.map(async ({ factory, fromBlock, eventAbi }) => {
    const logs = await getLogs({
      api,
      target: factory,
      eventAbi,
      onlyArgs: true,
      fromBlock,
    });

    return logs.map(log => log.fxpool || log.pool);
  }));

  const pools = poolData.flat();
  const filteredPools = pools.filter(pool => !mockPools.includes(pool.toLowerCase()));

  const poolIds = await api.multiCall({
    abi: "function getPoolId() view returns (bytes32)",
    calls: filteredPools,
  });

  const vaults = await api.multiCall({
    abi: "address:getVault",
    calls: filteredPools,
  });

  const data = await api.multiCall({
    abi: "function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)",
    calls: poolIds.map((v, i) => ({ target: vaults[i], params: v })),
  });

  data.forEach((i) => {
    api.addTokens(i.tokens, i.balances);
  });

  return api.getBalances();
}

const mockPools = [
  "0xd5482E64617E1baBA02B31fc3b3D766b9B9c42EA",
  "0x80B60cB5cf5683a8361bb56B534a15c7f21954ef"
].map(i => i.toLowerCase())

const config = {
  taiko: [
    {
      // FXPoolDeployer (USDC)
      factory: "0x018CEF7740535a156e0981059ACf19E74A886116",
      fromBlock: 235396,
      eventAbi: "event NewFXPool(address indexed caller, bytes32 indexed id, address indexed fxpool)",
    },
    {
      // Composable Stable Pool Factory
      factory: "0x298c1167E96528111544C8AD5401a2Ef57f5b7fF",
      fromBlock: 205068,
      eventAbi: "event PoolCreated(address indexed pool)",
    },
    {
      // Weighted Pool Factory
      factory: "0x701ef89a5bDc282408dBb37AB8A9b1c491Bf94D0",
      fromBlock: 204993,
      eventAbi: "event PoolCreated(address indexed pool)",
    },
  ],
};

module.exports = {
  methodology: "Sum of all the tokens locked in TanukiX Pools, including FXPools, Weighted Pools, and ComposableStable Pools",
  start: 1684368000, // May 18, 2023 (approximate Taiko testnet launch)
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
