const sui = require("../helper/chain/sui");
 
const SUILEND_LENDING_MARKET_ID = "0x84030d26d85eaa7035084a057f2f11f701b7e2e4eda87551becbc7c97505ece1";

async function tvl(api) {  
  const object = await sui.getObject(SUILEND_LENDING_MARKET_ID)
  for (const reserve of object.fields.reserves) {
    const coinType = '0x' + reserve.fields.coin_type.fields.name;
    api.add(coinType, reserve.fields.available_amount)
  }
}

async function borrowed(api) {
  const object = await sui.getObject(SUILEND_LENDING_MARKET_ID)
  for (const reserve of object.fields.reserves) {
    const coinType = '0x' + reserve.fields.coin_type.fields.name;
    api.add(coinType, reserve.fields.borrowed_amount.fields.value / 1e18)
  }
}

module.exports = {
  timetravel: false,
  sui: {
    tvl: tvl,
    borrowed: borrowed,
  },
}