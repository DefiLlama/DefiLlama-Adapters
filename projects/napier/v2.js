const ADDRESSES = require("../helper/coreAssets.json");
const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  ethereum: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    fromBlock: 21942450,
  },
  base: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    fromBlock: 26925181,
  },
  arbitrum: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    fromBlock: 314445420,
  },
  optimism: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    fromBlock: 133038145,
  },
  sonic: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    fromBlock: 12222609,
  },
  mantle: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    fromBlock: 76774978,
  },
  bsc: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    fromBlock: 47367768,
  },
  polygon: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    fromBlock: 68940928,
  },
  avax: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    fromBlock: 58592671,
  },
  fraxtal: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    fromBlock: 17433043,
  },
};

// Tracks TVL in Principal Token vaults and TwoCrypto pools
async function tvl(api) {
  const { factory, fromBlock } = config[api.chain];

  // Get all deployment events
  const deployLogs = await getLogs({
    api,
    target: factory,
    eventAbi:
      "event Deployed(address indexed principalToken, address indexed yt, address indexed pool, uint256 expiry, address target)",
    fromBlock,
  });

  const principalTokens = deployLogs.map((l) => l.principalToken);
  const pools = deployLogs.map((l) => l.pool);
  const targets = deployLogs.map((l) => l.target);

  // Get underlying assets and balances for PTs
  const assets = await api.multiCall({
    abi: "address:i_asset",
    calls: principalTokens,
  });

  // Get pool tokens and balances
  const [coin0s, coin1s] = await Promise.all([
    api.multiCall({
      abi: "function coins(uint256) view returns (address)",
      calls: pools.map((p) => ({ target: p, params: [0] })),
    }),
    api.multiCall({
      abi: "function coins(uint256) view returns (address)",
      calls: pools.map((p) => ({ target: p, params: [1] })),
    }),
  ]);

  // Combine all tokens and owners for balance checking
  const tokensAndOwners = [
    // PT vault holdings
    ...principalTokens.map((pt, i) => [targets[i], pt]),
    ...principalTokens.map((pt, i) => [assets[i], pt]),

    // Pool holdings
    ...pools.map((p, i) => [coin0s[i], p]),
    ...pools.map((p, i) => [coin1s[i], p]),
  ];

  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  methodology:
    "Tracks the total value locked in Napier Principal Token vaults and TwoCrypto pools",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
