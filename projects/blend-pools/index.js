const methodologies = require("../helper/methodologies");
const {
  PoolConfig,
  ReserveConfig,
  ReserveData,
  BackstopConfig,
} = require("@blend-capital/blend-sdk");
const { PromisePool } = require("@supercharge/promise-pool");

const BACKSTOP_ID = "CAO3AGAMZVRMHITL36EJ2VZQWKYRPWMQAPDQD5YEOF3GIF7T44U4JAL3";

const network = {
  rpc: "https://soroban-rpc.creit.tech/",
  passphrase: "Public Global Stellar Network ; September 2015",
};

const stellar_to_coingecko_map = {
  CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA: "stellar",
  CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75: "usd-coin",
};

function translateBalancesToCoingecko(balances) {
  const newBalances = {};
  for (const [address, balance] of Object.entries(balances)) {
    if (address in stellar_to_coingecko_map) {
      newBalances[stellar_to_coingecko_map[address]] = balance;
    } else {
      newBalances[address] = balance;
    }
  }
  return newBalances;
}

async function getReserveDeposits(poolId, reserveId) {
  let [config, data] = await Promise.all([
    ReserveConfig.load(network, poolId, reserveId),
    ReserveData.load(network, poolId, reserveId),
  ]);
  return (
    (Number(data.bRate) / 1e9) * (Number(data.bSupply) / 10 ** config.decimals)
  );
}

async function getReserveBorrowed(poolId, reserveId) {
  let [config, data] = await Promise.all([
    ReserveConfig.load(network, poolId, reserveId),
    ReserveData.load(network, poolId, reserveId),
  ]);
  return (
    (Number(data.dRate) / 1e9) * (Number(data.dSupply) / 10 ** config.decimals)
  );
}

async function addPoolTVL(poolId, balances) {
  let pool_config = await PoolConfig.load(network, poolId);
  await PromisePool.withConcurrency(4)
    .for(pool_config.reserveList)
    .process(async (reserveId) => {
      // pools have unique reserves
      let pool_deposit = await getReserveDeposits(poolId, reserveId);
      let cur_tvl = balances[reserveId] ?? 0;
      balances[reserveId] = cur_tvl + pool_deposit;
    });
}

async function addPoolBorrowed(poolId, balances) {
  let pool_config = await PoolConfig.load(network, poolId);
  await PromisePool.withConcurrency(4)
    .for(pool_config.reserveList)
    .process(async (reserveId) => {
      // pools have unique reserves
      let pool_deposit = await getReserveBorrowed(poolId, reserveId);
      let cur_tvl = balances[reserveId] ?? 0;
      balances[reserveId] = cur_tvl + pool_deposit;
    });
}

async function tvl() {
  let balances = {};
  let backstop = await BackstopConfig.load(network, BACKSTOP_ID);
  for (const pool of backstop.rewardZone) {
    await addPoolTVL(pool, balances);
  }
  return translateBalancesToCoingecko(balances);
}

async function borrowed() {
  let balances = {};
  let backstop = await BackstopConfig.load(network, BACKSTOP_ID);
  for (const pool of backstop.rewardZone) {
    await addPoolBorrowed(pool, balances);
  }
  return translateBalancesToCoingecko(balances);
}

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket}. TVL is calculated and totaled for all Blend pools in the Blend reward zone.`,
  stellar: {
    tvl: tvl,
    borrowed: borrowed,
  },
};
