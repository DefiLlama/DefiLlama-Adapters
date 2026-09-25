const { addUniV4PoolReserves } = require("../helper/uniswapV4");
const { getLogs2 } = require("../helper/cache/getLogs");

// Arc mainnet 5042. DefiLlama's `arc` chain is this network.
const FACTORY = "0xfB56bEe304c92374D5E08A5AD84540FDd69CdD8e";
const LOCKER = "0x8a5fc999b47d2DB835153CdB872cbbe6ab562767";
const BURN_VAULT = "0xc317945fB40B2FD565b7D5cD6B47a736b2933505";
const START_BLOCK = 22641802;

const USDC = "0x3600000000000000000000000000000000000000";
const STATE_VIEW = "0xF3334192D15450CdD385c8B70e03f9A6bD9E673b";

const launchedAbi =
  "event Launched(address indexed token, address indexed treasury, address indexed creator, address creatorRecipient, uint24 fee)";
const positionsAbi =
  "function positions(address) view returns (uint256 tokenId, address treasury, address currency0, address currency1, uint24 fee, int24 tickLower, int24 tickUpper)";
const poolIdAbi = "function poolIdFor(address) view returns (bytes32)";

async function tvl(api) {
  if (FACTORY === "0x0000000000000000000000000000000000000000") {
    throw new Error("Set the Arc mainnet factory, locker, and burn vault before submitting");
  }

  const logs = await getLogs2({
    api,
    target: FACTORY,
    eventAbi: launchedAbi,
    fromBlock: START_BLOCK,
    onlyArgs: true,
  });
  if (!logs.length) return;

  const tokens = logs.map((log) => log.token);
  const treasuries = logs.map((log) => log.treasury);
  const [positions, poolIds, balances] = await Promise.all([
    api.multiCall({ abi: positionsAbi, target: LOCKER, calls: tokens }),
    api.multiCall({ abi: poolIdAbi, target: FACTORY, calls: tokens }),
    api.multiCall({ abi: "erc20:balanceOf", target: USDC, calls: [...treasuries, BURN_VAULT] }),
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

  api.add(USDC, balances);
}

module.exports = {
  methodology:
    "Counts both tokens in each Parabolarc Uniswap v4 pool, plus USDC held in that token's treasury and in the $PARC burn vault. Pool inventory includes the locked launch position and the USDC floor.",
  start: 1790315996,
  timetravel: true,
  arc: { tvl },
};
