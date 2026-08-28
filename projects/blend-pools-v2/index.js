const { callSoroban } = require("../helper/chain/stellar");
const methodologies = require("../helper/methodologies");

const BACKSTOP_ID = "CAQQR5SWBXKIGZKPBZDH3KM5GQ5GUTPKB7JAFCINLZBC5WXPJKRG3IM7";

// Blend V2 pools.
//
// The backstop's reward_zone() is the only on-chain enumeration, but it lists
// the pools currently eligible for BLND emissions, not the pools that hold
// funds. Eligibility depends on a backstop threshold priced through the Comet
// BLND-USDC pool, and while that price reads zero no pool clears the threshold,
// so the zone empties even though every pool still custodies user deposits.
//
// Blend's own UI carries this same list for the same reason, see
// blend-ui/src/components/markets/MarketsList.tsx ("pools don't meet threshold
// due to comet bug"). Unioned with the reward zone so a newly added pool is
// still picked up automatically once emissions are working again.
const POOLS = [
  "CAJJZSGMMM3PD7N33TAPHGBUGTB43OC73HVIK2L2G6BNGGGYOSSYBXBD", // Fixed V2
  "CCCCIQSDILITHMM7PBSLVDT5MISSY7R26MNZXCX4H7J5JQ5FPIYOGYFS", // YieldBlox V2
  "CDMAVJPFXPADND3YRL4BSM3AKZWCTFMX27GLLXCML3PD62HEQS5FPVAI",
  "CC4HHXPKR3FIXUQEC53MAK2IVWD6APAEBBXP5XCIW5FISN6PQOAC6UXG",
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
