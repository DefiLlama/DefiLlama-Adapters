const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");
 
const LST_CREATE_EVENT_TYPE = '0xb0575765166030556a6eafd3b1b970eba8183ff748860680245b9edd41c716e7::events::Event<0xb0575765166030556a6eafd3b1b970eba8183ff748860680245b9edd41c716e7::liquid_staking::CreateEvent>';
const SUI_COIN_TYPE = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
const SPRINGSUI_COIN_TYPE = '0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf::spring_sui::SPRING_SUI';
const REGISTRY_PARENT_ID = '0xdc00dfa5ea142a50f6809751ba8dcf84ae5c60ca5f383e51b3438c9f6d72a86e';
const BLACKLISTED_LENDING_MARKET_IDS = [
  "0x6d9478307d1cb8417470bec42e38000422b448e9638d6b43b821301179ac8caf", // STEAMM LM (old)
  "0x8742d26532a245955630ff230b0d4b14aff575a0f3261efe50f571f84c4e4773", // Test 1
  "0x8843ed2e29bd36683c7c99bf7e529fcee124a175388ad4b9886b48f1009e6285", // Test 2
  "0x02b4b27b3aa136405c2aaa8e2e08191670f3971d495bfcd2dda17184895c20ad", // Test 3
];


async function tvl(api) {  
  const lendingMarketIds = await getLendingMarketIds()
  const redemptionRates = await getRedemptionRates()
  for (const lendingMarketId of lendingMarketIds) {
    const object = await sui.getObject(lendingMarketId)
    for (const reserve of object.fields.reserves) {
      const coinType = '0x' + reserve.fields.coin_type.fields.name;
      if (redemptionRates[coinType]) {
        api.add(SUI_COIN_TYPE, redemptionRates[coinType] * reserve.fields.available_amount)
      } else {
        api.add(coinType, reserve.fields.available_amount)
      }
    }
  }
}

async function borrowed(api) {
  const lendingMarketIds = await getLendingMarketIds()
  const redemptionRates = await getRedemptionRates()
  for (const lendingMarketId of lendingMarketIds) {
    const object = await sui.getObject(lendingMarketId)
    for (const reserve of object.fields.reserves) {
      const coinType = '0x' + reserve.fields.coin_type.fields.name;
      if (redemptionRates[coinType]) {
        api.add(SUI_COIN_TYPE, redemptionRates[coinType] * reserve.fields.borrowed_amount.fields.value / 1e18)
      } else {
        api.add(coinType, reserve.fields.borrowed_amount.fields.value / 1e18)
      }
    }
  }
}


async function getRedemptionRates() {
  const events = (await sui.queryEvents({
    eventType: LST_CREATE_EVENT_TYPE,
  }))
  const coinTypeToRate = {};
  for (const event of events) { 
    const coinType = '0x' + event.event.typename.name;
    if (coinType === SPRINGSUI_COIN_TYPE) {
      continue;
    }
    try {
      const poolId = event.event.liquid_staking_info_id;
      const data = await sui.getObject(poolId);
      const totalSupply = parseInt(data.fields.lst_treasury_cap.fields.total_supply.fields.value);
      const stakedSui = parseInt(data.fields.storage.fields.total_sui_supply);
      coinTypeToRate[coinType] = stakedSui / totalSupply;
    } catch (e) {
      continue;
    }
  }
  return coinTypeToRate;
}

async function getLendingMarketIds() {
  const dynamicFields = await sui.getDynamicFieldObjects({ parent: REGISTRY_PARENT_ID });
  const ids = [];
  for (const field of dynamicFields) {
    const lendingMarketId = field.fields.value;
    if (!BLACKLISTED_LENDING_MARKET_IDS.includes(lendingMarketId)) {
      ids.push(lendingMarketId);
    }
  }
  return ids;
}

module.exports = {
  timetravel: false,
  sui: {
    tvl: tvl,
    borrowed: borrowed,
  },
}