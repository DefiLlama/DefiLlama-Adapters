const BigNumber = require("bignumber.js");
const sui = require("../helper/chain/sui");
 
const SUILEND_LENDING_MARKET_ID = "0x84030d26d85eaa7035084a057f2f11f701b7e2e4eda87551becbc7c97505ece1";

async function tvl() {  
  const { api } = arguments[3]
  const object = await sui.getObject(SUILEND_LENDING_MARKET_ID)
  for (const reserve of object.fields.reserves) {
    const coinType = '0x' + reserve.fields.coin_type.fields.name;
    const amount = new BigNumber(reserve.fields.available_amount)
    api.add(coinType, amount.toString())
  }
}

async function borrowed() {
  const { api } = arguments[3]
  const object = await sui.getObject(SUILEND_LENDING_MARKET_ID)
  for (const reserve of object.fields.reserves) {
    const coinType = '0x' + reserve.fields.coin_type.fields.name;
    const amount = (new BigNumber(reserve.fields.borrowed_amount.fields.value)).dividedBy(new BigNumber(10 ** 18)).integerValue(BigNumber.ROUND_HALF_CEIL);
    api.add(coinType, amount.toString())
  }
}

module.exports = {
  timetravel: false,
  sui: {
    tvl: tvl,
    borrowed: borrowed,
  },
}