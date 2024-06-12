const {
  PoolConfig,
  ReserveData,
  BackstopConfig,
} = require("@blend-capital/blend-sdk");
const { PromisePool } = require("@supercharge/promise-pool");
const { sumTokens2 } = require('../helper/unwrapLPs')

const BACKSTOP_ID = "CAO3AGAMZVRMHITL36EJ2VZQWKYRPWMQAPDQD5YEOF3GIF7T44U4JAL3";

const network = {
  rpc: "https://soroban-rpc.creit.tech/",
  passphrase: "Public Global Stellar Network ; September 2015",
};

async function getReserveDeposits(poolId, reserveId, isBorrowed = false) {
  const data = await ReserveData.load(network, poolId, reserveId)
  const rate = Number(data.bRate) / 1e9
  const supply = Number(data.bSupply)
  const borrowed = Number(data.dSupply)
  if (isBorrowed)
    return borrowed * rate
  return (supply - borrowed) * rate
}


async function addPoolTVL(poolId, api, isBorrowed = false) {
  let pool_config = await PoolConfig.load(network, poolId);
  const { errors } = await PromisePool.withConcurrency(4)
    .for(pool_config.reserveList)
    .process(async (reserveId) => {
      // pools have unique reserves
      let pool_deposit = await getReserveDeposits(poolId, reserveId, isBorrowed);
      api.add(reserveId, pool_deposit)
    });
  if (errors.length > 0)
    throw new Error(errors)
}

async function tvl(api) {
  let backstop = await BackstopConfig.load(network, BACKSTOP_ID);
  for (const pool of backstop.rewardZone)
    await addPoolTVL(pool, api);

  return sumTokens2({ api })
}

async function borrowed(api) {
  let backstop = await BackstopConfig.load(network, BACKSTOP_ID);
  for (const pool of backstop.rewardZone)
    await addPoolTVL(pool, api, true);

  return sumTokens2({ api })
}

module.exports = {
  stellar: {
    tvl, borrowed,
  },
};
