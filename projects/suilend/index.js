const sui = require("../helper/chain/sui");
 
const SUILEND_LENDING_MARKET_ID = "0x84030d26d85eaa7035084a057f2f11f701b7e2e4eda87551becbc7c97505ece1";
const LST_CREATE_EVENT_TYPE = '0xb0575765166030556a6eafd3b1b970eba8183ff748860680245b9edd41c716e7::events::Event<0xb0575765166030556a6eafd3b1b970eba8183ff748860680245b9edd41c716e7::liquid_staking::CreateEvent>';
const SUI_COIN_TYPE = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
const SPRINGSUI_COIN_TYPE = '0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf::spring_sui::SPRING_SUI';

async function tvl(api) {  
  const redemptionRates = await getRedemtionRates()
  console.log(redemptionRates)
  const object = await sui.getObject(SUILEND_LENDING_MARKET_ID)

  for (const reserve of object.fields.reserves) {
    const coinType = '0x' + reserve.fields.coin_type.fields.name;
    if (redemptionRates[coinType]) {
      api.add(SUI_COIN_TYPE, redemptionRates[coinType] * reserve.fields.available_amount)
    } else {
      api.add(coinType, reserve.fields.available_amount)
    }
  }
}

async function borrowed(api) {
  const redemptionRates = await getRedemtionRates()
  const object = await sui.getObject(SUILEND_LENDING_MARKET_ID)
  for (const reserve of object.fields.reserves) {
    const coinType = '0x' + reserve.fields.coin_type.fields.name;
    if (redemptionRates[coinType]) {
      api.add(SUI_COIN_TYPE, redemptionRates[coinType] * reserve.fields.borrowed_amount.fields.value / 1e18)
    } else {
      api.add(coinType, reserve.fields.borrowed_amount.fields.value / 1e18)
    }
  }
}


async function getRedemtionRates() {
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
      const data = await sui.getObject(poolId)
      const totalSupply = parseInt(data.fields.lst_treasury_cap.fields.total_supply.fields.value) 
      const stakedSui = parseInt(data.fields.storage.fields.total_sui_supply);
      coinTypeToRate[coinType] = stakedSui / totalSupply;
    } catch(e) {
      continue
    }
  }
  return coinTypeToRate;
}



module.exports = {
  timetravel: false,
  sui: {
    tvl: tvl,
    borrowed: borrowed,
  },
}