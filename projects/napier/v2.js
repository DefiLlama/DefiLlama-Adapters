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
  plume: {
    factory: "0x00000081e37a462F3137C944D6bf2527eD6Afb01",
    fromBlock: 2376497,
  },
};

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain];

  const deployLogs = await getLogs({
    api,
    target: factory,
    topic: "0x43a42a2627e2eabb0a72e5fab92586a1ef1fde9b09ca5c0f05b56dc20d977da4",
    onlyArgs: true,
    eventAbi:
      "event Deployed(address indexed principalToken, address indexed yt, address indexed pool, uint256 expiry, address target)",
    fromBlock,
  });

  if (deployLogs.length === 0) return {};

  const principalTokens = deployLogs.map((l) => l.principalToken);
  const pools = deployLogs.map((l) => l.pool);
  const targets = deployLogs.map((l) => l.target);

  const [resolvers, assets] = await Promise.all([
    api.multiCall({ abi: "address:i_resolver", calls: principalTokens }),
    api.multiCall({ abi: "address:i_asset", calls: principalTokens }),
  ]);

  const scales = await api.multiCall({
    abi: "uint256:scale",
    calls: resolvers,
    permitFailure: true,
  });

  // Detect TokiHook pools via i_poolKey() — Curve pools revert, TokiHook succeeds
  const poolKeyResults = await api.multiCall({
    abi: "function i_poolKey() view returns (tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks))",
    calls: pools,
    permitFailure: true,
  });

  const tokensAndOwners = [];
  for (let i = 0; i < principalTokens.length; i++) {
    const isTokiHook = poolKeyResults[i] && poolKeyResults[i].currency0;

    // PT vault always holds target tokens directly
    tokensAndOwners.push([targets[i], principalTokens[i]]);

    // Curve pools hold target tokens directly — balanceOf works
    // TokiHook pools hold liquidity in PoolManager — balanceOf returns 0, skip
    if (!isTokiHook) {
      tokensAndOwners.push([targets[i], pools[i]]);
    }
  }

  const resInTargets = await sumTokens2({ api, tokensAndOwners });

  const targetToAsset = {};
  const targetToScale = {};
  targets.forEach((target, i) => {
    const key = `${api.chain}:${target.toLowerCase()}`;
    targetToAsset[key] = assets[i].toLowerCase();
    targetToScale[key] = scales[i];
  });

  const resInAsset = {};
  Object.entries(resInTargets).forEach(([targetId, balance]) => {
    const asset = targetToAsset[targetId];
    const scale = targetToScale[targetId];
    if (!asset || !scale || Number(balance) <= 0) return;

    const assetId = `${api.chain}:${asset}`;
    const adjustedBalance =
      (BigInt(balance) * BigInt(scale)) / BigInt(1e18);
    resInAsset[assetId] = resInAsset[assetId] ?? "0";
    resInAsset[assetId] = (
      BigInt(resInAsset[assetId]) + adjustedBalance
    ).toString();
  });

  return resInAsset;
}

module.exports = {
  methodology:
    "TVL is calculated on-chain by querying target token balances held in Principal Token vaults and AMM pools across all deployed markets.",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});
