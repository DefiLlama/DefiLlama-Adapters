const abi = require("./abi");
const { nullAddress, addUniV3LikePosition } = require("../helper/unwrapLPs");

const rankTokenAddress = "0x978aB3D5A5C39bCBb2a15f2ad324187dD7cBf952";

const rankFactoryContracts = [
  "0x6E9d30690E433503d3dB7001610f60290a286a3f",
  "0x7cD6ead7e0834Ae8bc393bA4c933Bb9e80e7dC19"
];

const stakingContracts = [{poolAddress: "0xd6A07b8065f9e8386A9a5bBA6A754a10A9CD1074", poolId: 380}];
const vestingContracts = [
  [rankTokenAddress, "0x582c5ae03f55a3eb5e79f8d3e2cf9712c331a3b0"],
  [rankTokenAddress, "0xd2b1c19dc746331829918fe3517a40935ebb53f0"],
  [rankTokenAddress, "0xd041c5d24491dff050f40fab5d485530ebe441c2"]
];

const tokenIds = [2494259];
const postionManager = "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364";
const factory = "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865";

async function tvl(api) {
  const factorySettings = await api.multiCall({
    abi: abi["factorySettings"],
    calls: rankFactoryContracts,
    permitFailure: true,
  });
  const tokens = factorySettings.map((f) => f.asset);
  const rankStrategiesCounts = await api.multiCall({
    abi: abi["rankStrategiesCount"],
    calls: rankFactoryContracts,
    permitFailure: true,
  });

  for (let i = 0; i < rankFactoryContracts.length; i++) {
    const rankFactoryContract = rankFactoryContracts[i];
    const token = tokens[i];
    const rankStrategiesCount = rankStrategiesCounts[i];

    const rankStrategyContracts = await api.multiCall({
      abi: abi["rankStrategies"],
      target: rankFactoryContract,
      calls: Array.from({ length: rankStrategiesCount }, (_, i) => (
        { params: [i] }
      )),
    });
    const totals = await api.multiCall({
      abi: abi["totals"],
      calls: rankStrategyContracts,
      permitFailure: true,
    });
    
    totals.forEach((total) => {
      if (total) {
        api.add(token, total.assetAmount);
      }
    });
  }
}

async function staking(api) {
  for (let stakingContract of stakingContracts) {
    const { poolAddress, poolId } = stakingContract;
    const stake = await api.call({
      abi: abi["poolInfo"],
      target: poolAddress,
      params: poolId,
    });
    api.add(stake.stakingToken, stake.totalStaked);
    api.add(stake.rewardToken, stake.totalReward);
  }
}

async function vesting(api) {
  const vestedAmount = api.sumTokens({ tokensAndOwners: vestingContracts });
  return vestedAmount;
}

async function liquidity(api) {
  const getKey = (token0, token1, fee) => `${token0}-${token1}-${fee}`;
  const positionData = await api.multiCall({ calls: tokenIds, abi: abi.positions, target: postionManager });
  const poolData = {};
  positionData.forEach(({ token0, token1, tokensOwed0, tokensOwed1, fee, liquidity }) => {
    if (liquidity === 0) return;
    if (token0 === nullAddress && token1 === nullAddress) return;
    poolData[getKey(token0, token1, fee)] = { call: { params: [token0, token1, fee] } };
    api.add(token0, tokensOwed0);
    api.add(token1, tokensOwed1);
  });
  
  // fetch tick info from uni v3 pools
  const calls = Object.values(poolData).map(i => i.call);
  const pools = await api.multiCall({ abi: abi.getPool, calls, target: factory });
  const ticks = await api.multiCall({ abi: abi.slot0, calls: pools, permitFailure: true });
  Object.values(poolData).forEach((data, i) => data.tick = ticks[i]?.tick);
  
  positionData.forEach(({ token0, token1, tickUpper, tickLower, fee, liquidity }) => {
    if (+liquidity === 0) return;
    const tick = poolData[getKey(token0, token1, fee)]?.tick;
    if (!tick) console.log({ token0, token1, fee, tickUpper, tickLower, liquidity });
    if (!tick) return;  // pool not found
    addUniV3LikePosition({ api, token0, token1, tick, liquidity, tickUpper, tickLower, });
  })
}

module.exports = {
  methodology: "TVL = Sum of all assets locked in Rank Trading contracts, Staking = Total $RAN staked in the Staking Pools, Vesting = Total $RAN in vesting contracts, Liquidity = Total locked liquidity in V3 pools",
  start: 48201631,
  bsc: {
    tvl,
    staking,
    vesting,
    pool2: liquidity
  },
};
