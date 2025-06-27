const sui = require("../helper/chain/sui");
 
const JACKSON_VAULT_ID = "0x488d6e1079a3a6d29e6ab536ee73117d80495a8871e49511daa67ff63747e92b";

async function tvl(api) {
  const object = await sui.getObject(JACKSON_VAULT_ID)
  for (const reserve of object.fields.reserves) {
    const coinType = '0x' + reserve.fields.coin_type.fields.name;
    api.add(coinType, reserve.fields.available_amount)
  }
}


module.exports = {
  sui: {
    tvl: tvl,
  },
}
