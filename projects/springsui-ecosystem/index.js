const sui = require('../helper/chain/sui')

const LIQUID_STAKING_INFO_TYPE = '0xb0575765166030556a6eafd3b1b970eba8183ff748860680245b9edd41c716e7::liquid_staking::LiquidStakingInfo';
const EXCLUDE_POOL_IDS = [
  '0x15eda7330c8f99c30e430b4d82fd7ab2af3ead4ae17046fcb224aa9bad394f6b',
]

async function tvl() {
  let suiAmount = 0;
  const data = (await sui.getObjectsByType(LIQUID_STAKING_INFO_TYPE))
    .filter((pool) => pool && !EXCLUDE_POOL_IDS.includes(pool.fields.id.id));

  data.forEach((pool) => {
    if (!pool) return;
    suiAmount += pool.fields.storage.fields.total_sui_supply / 10 ** 9;
  });
  return {
    sui: suiAmount,
  }
}


module.exports = {
  methodology: "Calculates the amount of SUI staked in ecosystem SpringSui LSTs.",
  sui: {
    tvl,
  }
}
