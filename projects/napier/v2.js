const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const TOKI_LENS_GET_TVL_ABI =
  "function getTVL(address pool) view returns (tuple(uint256 ptTVLInShare, uint256 ptTVLInAsset, uint256 ptTVLInUSD, uint256 poolTVLInShare, uint256 poolTVLInAsset, uint256 poolTVLInUSD))";

const config = {
  ethereum: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    tokiLens: "0x00000031F662013D68E6CD0ceFe97043AE0ac5b8",
    fromBlock: 21942450,
  },
  base: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    fromBlock: 26925181,
  },
  arbitrum: {
    factory: "0x0000001afbCA1E8CF82fe458B33C9954A65b987B",
    tokiLens: "0x000000896D3C2837797e9f334b4Cf366Bf645fdF",
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
  const { factory, tokiLens, fromBlock } = config[api.chain];

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

  // PT vaults + all pools hold target tokens
  const tokensAndOwners = [
    ...principalTokens.map((pt, i) => [targets[i], pt]),
    ...pools.map((p, i) => [targets[i], p]),
  ];

  await sumTokens2({ api, tokensAndOwners });

  // TokiHook pools hold liquidity in Uniswap V4 PoolManager, not the pool contract
  // balanceOf returns 0 — use TokiLens to get actual TVL
  if (tokiLens) {
    const poolKeyResults = await api.multiCall({
      abi: "function i_poolKey() view returns (tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks))",
      calls: pools,
      permitFailure: true,
    });

    const tokiHookIndexes = [];
    for (let i = 0; i < pools.length; i++) {
      if (poolKeyResults[i]?.currency0) tokiHookIndexes.push(i);
    }

    if (tokiHookIndexes.length > 0) {
      const tvlResults = await api.multiCall({
        abi: TOKI_LENS_GET_TVL_ABI,
        target: tokiLens,
        calls: tokiHookIndexes.map((i) => pools[i]),
        permitFailure: true,
      });

      for (let j = 0; j < tokiHookIndexes.length; j++) {
        const tvlData = tvlResults[j];
        if (!tvlData) continue;
        const poolTVL = BigInt(tvlData.poolTVLInShare || 0);
        if (poolTVL > 0n) {
          api.add(targets[tokiHookIndexes[j]], poolTVL.toString());
        }
      }
    }
  }
  return api.getBalances()
}

module.exports = {
  methodology:
    "TVL is calculated on-chain by querying target token balances held in Principal Token vaults and AMM pools across all deployed markets.",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});