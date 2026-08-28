const { callSoroban } = require("../helper/chain/stellar");
const methodologies = require("../helper/methodologies");

const BACKSTOP_ID = "CAQQR5SWBXKIGZKPBZDH3KM5GQ5GUTPKB7JAFCINLZBC5WXPJKRG3IM7";

// Blend V2 pools.
//
// The backstop's reward_zone() is the only on-chain enumeration of pools, but
// it lists the pools currently eligible for BLND emissions, not the pools that
// hold funds. Governance can empty or rotate it while every pool still
// custodies user deposits, so TVL must not be derived from it alone. Pools are
// listed explicitly here and unioned with the reward zone, so a new pool is
// picked up automatically and an empty zone cannot zero the protocol.
const POOLS = [
  "CAJJZSGMMM3PD7N33TAPHGBUGTB43OC73HVIK2L2G6BNGGGYOSSYBXBD", // Fixed V2
  "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS", // YieldBlox V2
];

// b_rate / d_rate are 12-decimal fixed point, so shares * rate / 1e12 gives the
// underlying token amount in its own base units.
const RATE_SCALAR = 10n ** 12n;

async function getPools() {
  let rewardZone = [];
  try {
    rewardZone = await callSoroban(BACKSTOP_ID, "reward_zone");
  } catch (e) {
    // A backstop that cannot be read must not silently shrink the pool set.
  }
  return [...new Set([...POOLS, ...rewardZone])];
}

async function sumPools(api, pick) {
  const pools = await getPools();
  await Promise.all(
    pools.map(async (pool) => {
      const assets = await callSoroban(pool, "get_reserve_list");
      await Promise.all(
        assets.map(async (asset) => {
          const { data } = await callSoroban(pool, "get_reserve", [asset]);
          const supplied =
            (BigInt(data.b_supply) * BigInt(data.b_rate)) / RATE_SCALAR;
          const borrowed =
            (BigInt(data.d_supply) * BigInt(data.d_rate)) / RATE_SCALAR;
          api.add(asset, pick(supplied, borrowed).toString());
        })
      );
    })
  );
}

// Borrowed tokens are not in the contract, so TVL is supplied minus borrowed.
const tvl = (api) => sumPools(api, (supplied, borrowed) => supplied - borrowed);
const borrowed = (api) => sumPools(api, (_supplied, borrowed) => borrowed);

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket} TVL is totalled across all Blend V2 pools. Outstanding debt is reported separately as borrowed.`,
  stellar: {
    tvl,
    borrowed,
  },
};
