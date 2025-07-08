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
  hyperliquid: {
    factory: "0x000000488f0fB672CEc8ec4B90980e7C6E492E22",
    fromBlock: 1028801,
  },
};

// Tracks TVL in Principal Token vaults and TwoCrypto pools
async function tvl(api) {
  const { factory, fromBlock } = config[api.chain];


  // Get all deployment events
  const deployLogs = await getLogs({
    api,
    target: factory,
    topic: "0x43a42a2627e2eabb0a72e5fab92586a1ef1fde9b09ca5c0f05b56dc20d977da4",
    onlyArgs: true,
    eventAbi:
      "event Deployed(address indexed principalToken, address indexed yt, address indexed pool, uint256 expiry, address target)",
    fromBlock,
  });

  let principalTokens = deployLogs.map((l) => l.principalToken);
  let pools = deployLogs.map((l) => l.pool);
  let targets = deployLogs.map((l) => l.target);

  // Get underlying assets and balances for PTs
  const [resolvers, assets] = await Promise.all([
    api.multiCall({
      abi: "address:i_resolver", 
      calls: principalTokens,
    }),
    api.multiCall({
      abi: "address:i_asset",
      calls: principalTokens,
    }),
  ]);

  const scales = await api.multiCall({
    abi: "uint256:scale",
    calls: resolvers,
  });


  const targetToAsset = targets.reduce((acc, target, i) => {
    acc[getTokenId(api.chain, target)] = assets[i].toLowerCase();
    return acc;
  }, {});

  const targetToScale = targets.reduce((acc, target, i) => {
    acc[getTokenId(api.chain, target)] = scales[i];
    return acc;
  }, {});


  // Combine all tokens and owners for balance checking
  const tokensAndOwners = [
    // PT vault holdings
    ...principalTokens.map((pt, i) => [targets[i], pt]),
    // Pool holdings
    ...pools.map((p, i) => [targets[i], p]),
  ];

  const resInTargets  = await sumTokens2({ api, tokensAndOwners });
  const resInAsset = {};

  Object.entries(resInTargets).forEach(([targetId, balance]) => {
    const asset = targetToAsset[targetId];
    const assetId = getTokenId(api.chain, asset);
    const scale = targetToScale[targetId];
    if (Number(balance) > 0) {
      const adjustedBalance = BigInt(balance) * BigInt(scale) / BigInt(1e18);
      resInAsset[assetId] = resInAsset[assetId] ?? "0";
      resInAsset[assetId] = (BigInt(resInAsset[assetId]) + adjustedBalance).toString();
    } 
  });

  return resInAsset;
}

function getTokenId(chain, token) {
  return `${chain}:${token.toLowerCase()}`;
}


module.exports = {
  methodology:
    "Tracks the total value locked in Napier Principal Token vaults and TwoCrypto pools",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
