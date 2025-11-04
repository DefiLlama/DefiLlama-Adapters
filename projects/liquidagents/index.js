const sui = require('../helper/chain/sui')

const CREATE_EVENT_TYPE = '0xb0575765166030556a6eafd3b1b970eba8183ff748860680245b9edd41c716e7::events::Event<0xb0575765166030556a6eafd3b1b970eba8183ff748860680245b9edd41c716e7::liquid_staking::CreateEvent>';
const INCLUDE_POOL_IDS = [
  '0x14347e46d48e39a33c8d4e63d5e95d513014ceced519d96ce1510b0dfadd6cd6', // JUG_SUI
  '0x4f020d1e6d4a5b1269948963587877e7217bcdc5978ddbb393b0ec015f83bbbd', // KOIT_SUI
  '0x0ba25d23da5da7fe121a0fd27e9404b3551c6dd1fa3c8887a94ac4e92ca13822', // NEURA_SUI,
  '0xfd0de51ed8bbff6629b3ec5aa7da9ae0d4d3a507093f32ecd0911dcf0e9e98fe', // EXP_SUI
  '0x51f6687d7c7da1a216b790181fcc79bad0251f6fe754b59f4ec9b809d7bb1a45', // FL_SUI
  '0x132ccf683f4b963a7d24a3853fef4bce592ef81a647653f0aa3bc800e9473d93', // NDWS_SUI
  '0x4dd83eca8da3a86594a5b8253a1731dad36b323bbbb088b4d160dd2ae8f33ab5', // ROGUE_SUI
  '0x84e4c99591f5539cdee09568a650c0a552a95f0b215c2d8b353456eea0fed1f1', // DOGE_SUI'
  '0x3e167bc4f32de3702380148144529fbb01e4d2766319eb8ff7ea9b865fd2997b', // GALAXY_SUI
]

async function tvl() {
  const poolIds = (await sui.queryEvents({
    eventType: CREATE_EVENT_TYPE,
    transform: (i) => i.event.liquid_staking_info_id,
  })).filter((id) => INCLUDE_POOL_IDS.includes(id));

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
