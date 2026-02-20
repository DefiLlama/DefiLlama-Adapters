const sui = require("../helper/chain/sui");

const REGISTRY_PARENT_ID = '0xdc00dfa5ea142a50f6809751ba8dcf84ae5c60ca5f383e51b3438c9f6d72a86e';
const BLACKLISTED_LENDING_MARKET_IDS = [
  "0x6d9478307d1cb8417470bec42e38000422b448e9638d6b43b821301179ac8caf", // STEAMM LM (old)
  "0x8742d26532a245955630ff230b0d4b14aff575a0f3261efe50f571f84c4e4773", // Test 1
  "0x8843ed2e29bd36683c7c99bf7e529fcee124a175388ad4b9886b48f1009e6285", // Test 2
  "0x02b4b27b3aa136405c2aaa8e2e08191670f3971d495bfcd2dda17184895c20ad", // Test 3
];

const isBlacklistedToken = coin => coin.includes('STEAMM_LP')

async function tvl(api) {
  const lendingMarketIds = await getLendingMarketIds()
  for (const object of lendingMarketIds) {
    for (const reserve of object.fields.reserves) {
      const coinType = '0x' + reserve.fields.coin_type.fields.name;
      if (!isBlacklistedToken(coinType))
        api.add(coinType, reserve.fields.available_amount)
    }
  }
}

async function borrowed(api) {
  const lendingMarketIds = await getLendingMarketIds()
  for (const object of lendingMarketIds) {
    for (const reserve of object.fields.reserves) {
      const coinType = '0x' + reserve.fields.coin_type.fields.name;
      if (!isBlacklistedToken(coinType))
        api.add(coinType, reserve.fields.borrowed_amount.fields.value / 1e18)
    }
  }
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
  return sui.getObjects(ids);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
    borrowed,
  },
}