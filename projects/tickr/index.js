const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/tokenMapping");

// Tickr — Non-Fungible Ticker launchpad on Uniswap v4.
//
// Each launched ERC-20 deploys its own ETH/Token v4 pool, seeds the pool with
// the entire 1B supply, and burns the LP NFT to 0xdEaD in the same tx. The
// liquidity therefore stays in the v4 PoolManager forever — the only path
// for tokens or ETH to leave a pool is via a swap.
//
// To isolate Tickr pools from the rest of v4, we filter the PoolManager's
// Initialize event by `hooks == LaunchHook`. Each matched pool contributes
// its token-side balance held by PoolManager; DefiLlama prices the tokens
// via the same v4 pools so the resulting TVL reflects the live pool value.
const config = {
  ethereum: {
    poolManager: "0x000000000004444c5dc75cB358380D2e3dE08A90", // canonical v4 mainnet
    hook:        "0x8Bd422134164F74023308A22BA991Ae0412900cC", // Tickr LaunchHook
    fromBlock:   24994342, // factory deploy block
  },
};

const initializeAbi =
  "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)";

async function tvl(api) {
  const { poolManager, hook, fromBlock } = config[api.chain];

  // 1) Pull every PoolManager.Initialize log since Tickr's factory deploy.
  const logs = await getLogs2({
    api,
    target: poolManager,
    eventAbi: initializeAbi,
    fromBlock,
  });

  // 2) Keep only Tickr pools — i.e. those bound to the LaunchHook.
  const tickrPools = logs.filter(
    (l) => l.hooks.toLowerCase() === hook.toLowerCase(),
  );

  // 3) Build the (tokens, owner) list. currency0 is native ETH (nullAddress)
  //    on every Tickr pool; currency1 is the launched ERC-20.
  const tokenSet = new Set();
  for (const p of tickrPools) {
    tokenSet.add(p.currency0); // ETH (null)
    tokenSet.add(p.currency1); // Tickr token
  }

  const ownerTokens = [[Array.from(tokenSet), poolManager]];

  // sumTokens2 reads balanceOf(poolManager) for every ERC-20 in the list and
  // adds the native ETH balance held at poolManager. The ETH leg is shared
  // across all v4 pools — DefiLlama's price feed handles the per-pool token
  // mark-to-market via the Uniswap v4 pool itself.
  return sumTokens2({
    api,
    ownerTokens,
    permitFailure: true,
  });
}

module.exports = {
  methodology:
    "Tickr deploys ERC-20 tokens that each receive a dedicated Uniswap v4 ETH/Token pool, seeded with the entire 1B supply and with the LP NFT burned to 0xdead at launch — liquidity is therefore locked permanently and only exits via swaps. TVL is the sum of token balances held by the v4 PoolManager for every pool whose hook is the Tickr LaunchHook (filtered from the PoolManager's Initialize event since Tickr's factory deploy block).",
  start: 24994342,
  ethereum: { tvl },
};
