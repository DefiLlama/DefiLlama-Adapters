const {
  BackstopConfig,
  PoolV2,
} = require("@blend-capital/blend-sdk");
const { PromisePool } = require("@supercharge/promise-pool");
const { sumTokens2 } = require('../helper/unwrapLPs')

const BACKSTOP_ID = "CAQQR5SWBXKIGZKPBZDH3KM5GQ5GUTPKB7JAFCINLZBC5WXPJKRG3IM7";

const network = {
  rpc: "https://soroban-rpc.creit.tech/",
  passphrase: "Public Global Stellar Network ; September 2015",
};

async function addPoolTVL(poolId, api, isBorrowed = false) {
  let pool = await PoolV2.load(network, poolId);
  
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
