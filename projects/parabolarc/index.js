const { addUniV4PoolReserves } = require("../helper/uniswapV4");
const { getLogs2 } = require("../helper/cache/getLogs");

const STATE_VIEW = "0xF3334192D15450CdD385c8B70e03f9A6bD9E673b";
const TICK_SPACING = 10;

const launchedAbi =
  "event Launched(address indexed token, address indexed treasury, address indexed creator, address creatorRecipient, uint24 fee)";
const positionsAbi =
  "function positions(address) view returns (uint256 tokenId, address treasury, address currency0, address currency1, uint24 fee, int24 tickLower, int24 tickUpper)";
const poolIdAbi = "function poolIdFor(address) view returns (bytes32)";

const ARC_SOURCES = [
  {
    factory: "0xfB56bEe304c92374D5E08A5AD84540FDd69CdD8e",
    locker: "0x8a5fc999b47d2DB835153CdB872cbbe6ab562767",
    fromBlock: 22641802,
  },
];

const ROBINHOOD_SOURCES = [
  {
    factory: "0x130B2E0464304101F06c00c39753f8b49E20965F",
    locker: "0xd244b1BeB80594dc862F9eF0104c16766f4ef6AC",
    fromBlock: 73808517,
  },
  {
    factory: "0x9919B35F6a09Ac15af8BA3d3B5B4322C316De582",
    locker: "0x85DFeBAa3FcB5d4f95Ed19595c14608e81cc0953",
    fromBlock: 73808517,
  },
  {
    factory: "0x6115288769FddaE13f705f4EB8b4Ac87F9236A4a",
    locker: "0xa6e2977d3FdcC95a3344c1b87BB9015884990Ec8",
    fromBlock: 73808517,
  },
  {
    factory: "0xE8dED504EfDCE8d53C5043E9582177A43C8c446F",
    locker: "0x9a7d001A924A22508Ef30014818f1567BEE80bAf",
    fromBlock: 73808517,
  },
  {
    factory: "0x10E577e705935Cee523c4ef46b730eE6785f2842",
    locker: "0xE5F74621A05A3AdAE13c691f2D809962aB50e26C",
    fromBlock: 73808517,
  },
];

async function tvlFrom(api, sources) {
  const pools = [];
  const tokens = [];

  for (const { factory, locker, fromBlock } of sources) {
    const logs = await getLogs2({
      api,
      target: factory,
      eventAbi: launchedAbi,
      fromBlock,
      onlyArgs: true,
    });
    if (!logs.length) continue;

    const launched = logs.map((log) => log.token);
    const [positions, poolIds] = await Promise.all([
      api.multiCall({ abi: positionsAbi, target: locker, calls: launched }),
      api.multiCall({ abi: poolIdAbi, target: factory, calls: launched }),
    ]);

    launched.forEach((token, i) => {
      tokens.push(token);
      pools.push({
        id: poolIds[i],
        token0: positions[i].currency0,
        token1: positions[i].currency1,
        spacing: TICK_SPACING,
      });
    });
  }

  if (!pools.length) return;

  await addUniV4PoolReserves({
    api,
    stateView: STATE_VIEW,
    pools,
  });

  tokens.forEach((token) => api.removeTokenBalance(token));
}

async function tvlArc(api) {
  return tvlFrom(api, ARC_SOURCES);
}

async function tvlRobinhood(api) {
  return tvlFrom(api, ROBINHOOD_SOURCES);
}

module.exports = {
  methodology:
    "TVL is the quote-asset side of each Parabolarc Uniswap v4 launch pool, including the locked launch position and the floor. On Arc that quote is USDC. On Robinhood it is native ETH for the one-pair and multi factories, and for the stock factories it is whichever token each launch is paired against (a Robinhood stock token or another ERC20), including earlier factories that still have live launches. The launched tokens are excluded, since their only market is the pool Parabolarc seeded. Extra multi-quote pools besides the ETH/USDC market, fee treasuries, and the $PARC buyback vault are excluded. Marked doublecounted because the pools sit in the Uniswap v4 PoolManager and are already inside Uniswap v4's TVL on that chain.",
  start: 1790315996,
  timetravel: true,
  doublecounted: true,
  arc: { tvl: tvlArc },
  robinhood: { tvl: tvlRobinhood },
};
