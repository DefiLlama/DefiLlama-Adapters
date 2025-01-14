const sui = require('../helper/chain/sui')

const CREATE_EVENT_TYPE = '0xb0575765166030556a6eafd3b1b970eba8183ff748860680245b9edd41c716e7::events::Event<0xb0575765166030556a6eafd3b1b970eba8183ff748860680245b9edd41c716e7::liquid_staking::CreateEvent>';
const EXCLUDE_POOL_IDS = [
  '0x15eda7330c8f99c30e430b4d82fd7ab2af3ead4ae17046fcb224aa9bad394f6b',
]

async function tvl() {
  const poolIds = (await sui.queryEvents({
    eventType: CREATE_EVENT_TYPE,
    transform: (i) => i.event.liquid_staking_info_id,
  })).filter((id) => !EXCLUDE_POOL_IDS.includes(id));

  let suiAmount = 0;
  const data = await sui.getObjects(poolIds);

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
