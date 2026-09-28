const { addUniV4PoolReserves } = require("../helper/uniswapV4");
const { getLogs2 } = require("../helper/cache/getLogs");

// Arc mainnet 5042. DefiLlama's `arc` chain is this network.
const FACTORY = "0xfB56bEe304c92374D5E08A5AD84540FDd69CdD8e";
const LOCKER = "0x8a5fc999b47d2DB835153CdB872cbbe6ab562767";
const START_BLOCK = 22641802;

const STATE_VIEW = "0xF3334192D15450CdD385c8B70e03f9A6bD9E673b";

const launchedAbi =
  "event Launched(address indexed token, address indexed treasury, address indexed creator, address creatorRecipient, uint24 fee)";
const positionsAbi =
  "function positions(address) view returns (uint256 tokenId, address treasury, address currency0, address currency1, uint24 fee, int24 tickLower, int24 tickUpper)";
const poolIdAbi = "function poolIdFor(address) view returns (bytes32)";

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FACTORY,
    eventAbi: launchedAbi,
    fromBlock: START_BLOCK,
    onlyArgs: true,
  });
  if (!logs.length) return;

  const tokens = logs.map((log) => log.token);
  const [positions, poolIds] = await Promise.all([
    api.multiCall({ abi: positionsAbi, target: LOCKER, calls: tokens }),
    api.multiCall({ abi: poolIdAbi, target: FACTORY, calls: tokens }),
  ]);

  await addUniV4PoolReserves({
    api,
    stateView: STATE_VIEW,
    pools: tokens.map((_, i) => ({
      id: poolIds[i],
      token0: positions[i].currency0,
      token1: positions[i].currency1,
      spacing: 10,
    })),
  });

  // Only the quote side counts: a launched token's only market is the pool Parabolarc seeded
  tokens.forEach((token) => api.removeTokenBalance(token));
}

module.exports = {
  methodology:
    "TVL is the quote-asset (USDC) side of each Parabolarc Uniswap v4 launch pool, including the locked launch position and the USDC floor. The launched tokens are excluded, since their only market is the pool Parabolarc seeded. Fee revenue held in the per-launch treasuries and the $PARC buyback vault is excluded. Marked doublecounted because the pools sit in the Uniswap v4 PoolManager on Arc and are already inside Uniswap v4's TVL there.",
  start: 1790315996,
  timetravel: true,
  doublecounted: true,
  arc: { tvl },
};
