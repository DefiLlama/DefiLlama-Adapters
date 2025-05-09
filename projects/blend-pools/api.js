const {
  BackstopConfig,
  PoolV1,
} = require("@blend-capital/blend-sdk");
const { PromisePool } = require("@supercharge/promise-pool");
const { sumTokens2 } = require('../helper/unwrapLPs')

const BACKSTOP_ID = "CAO3AGAMZVRMHITL36EJ2VZQWKYRPWMQAPDQD5YEOF3GIF7T44U4JAL3";

const network = {
  rpc: "https://soroban-rpc.creit.tech/",
  passphrase: "Public Global Stellar Network ; September 2015",
};

async function addPoolTVL(poolId, api, isBorrowed = false) {
  let pool = await PoolV1.load(network, poolId);
  
  for (const [reserveId, reserve] of Array.from(pool.reserves)) {
    const supply = reserve.totalSupply();
    const borrowed = reserve.totalLiabilities();
    if (isBorrowed) {
      api.add(reserveId, borrowed);
    } else {
      api.add(reserveId, supply - borrowed);
    }
  }

}

async function tvl(api) {
  let backstop = await BackstopConfig.load(network, BACKSTOP_ID);
  for (const pool of backstop.rewardZone){
    await addPoolTVL(pool, api);
}
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
