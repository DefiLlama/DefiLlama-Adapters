const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const getStrategiesDetails =
  "function strategies(bytes32) view returns ( tuple(address pool, int24 tickLower, int24 tickUpper) key, address owner, bytes actions, bytes actionStatus, bool isCompound, bool isPrivate, uint256 managementFee, uint256 performanceFee, tuple(uint256 fee0, uint256 fee1, uint256 balance0, uint256 balance1, uint256 totalShares, uint128 uniswapLiquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128) account)";
const burn =
  "function burn(int24, int24, uint128) returns (uint256 amount0, uint256 amount1)";
const token0 = "function token0() returns (address)";
const token1 = "function token1() returns (address)";
const getStrategyReserves =
  "function getStrategyReserves(address, int24, int24, uint128) returns (uint256 reserves0, uint256 reserves1)";

const ADDRESSES = {
  arbitrum: {
    CLTBASE: "0x3e0aa2e17fe3e5e319f388c794fdbc3c64ef9da6",
    HELPER: "0x9d80597d9403bdb35b3d7d9f400377e790b01053",
  },
};

const DEFAULT_STRATEGY_CREATION_TOPIC = "StrategyCreated(bytes32)";
const STRATEGY_CREATION_TOPIC = {
  arbitrum: "StrategyCreated(bytes32)",
};

const START_BLOCKS = {
  arbitrum: {
    CLTBASE: 190945156,
  },
};

async function getStrategiesLogs(strategies, factoryType, api) {
  const chain = api.chain;
  let topic = DEFAULT_STRATEGY_CREATION_TOPIC;
  if (STRATEGY_CREATION_TOPIC[chain]) topic = STRATEGY_CREATION_TOPIC[chain];

  const strategyLogs = await getLogs({
    target: ADDRESSES[chain][factoryType],
    topic,
    fromBlock: START_BLOCKS[chain][factoryType],
    api,
  });

  for (let log of strategyLogs) {
    strategies.push(log.topics[1]);
  }

  return strategies;
}

async function tvl(api) {
  const chain = api.chain;
  const strategies = [];
  const pools = new Set();
  const token0Calls = [];
  const token1Calls = [];
  const reservesCalls = [];

  for (const label of Object.keys(START_BLOCKS[api.chain]))
    await getStrategiesLogs(strategies, label, api);

  const strategyDetails = await api.multiCall({
    abi: getStrategiesDetails,
    calls: strategies.map((strategy) => ({
      target: ADDRESSES[chain].CLTBASE,
      params: strategy,
    })),
  });

  strategyDetails.forEach((detail) => {
    token0Calls.push({
      target: detail.key.pool,
      params: [],
    });
    token1Calls.push({
      target: detail.key.pool,
      params: [],
    });
    pools.add(detail.key.pool);

    reservesCalls.push({
      target: ADDRESSES[chain].HELPER,
      params: [
        detail.key.pool,
        Number(detail.key.tickLower),
        Number(detail.key.tickUpper),
        detail.account.uniswapLiquidity,
      ],
    });
  });

  const [token0Addresses, token1Addresses, reserves] = await Promise.all([
    api.multiCall({
      abi: token0,
      calls: token0Calls,
    }),
    api.multiCall({
      abi: token1,
      calls: token1Calls,
    }),
    api.multiCall({
      abi: getStrategyReserves,
      calls: reservesCalls,
    }),
  ]);

  reserves.forEach((reserve, index) => {
    if (Number(reserve.reserves0) > 0) {
      api.add(token0Addresses[index], reserve.reserves0);
    }
    if (Number(reserve.reserves1) > 0) {
      api.add(token1Addresses[index], reserve.reserves1);
    }
  });

  return sumTokens2({
    owner: ADDRESSES[chain].CLTBASE,
    tokens: [...token0Addresses, ...token1Addresses],
    api,
  });
}

module.exports = {
  doublecounted: true,
};

Object.keys(ADDRESSES).forEach((chain) => {
  module.exports[chain] = { tvl };
});
