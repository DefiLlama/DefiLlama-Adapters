const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");

const DATA_STORE_ID =
  "0x740d972ea066fe3302ee655163373cda2e9529bfa93d2266e1355cf56899da57";

async function suiTvl(api) {
  const object = await sui.getObject(DATA_STORE_ID);
  const bankID = object.fields.asset_bank.fields.id.id;
  const assetBank = await sui.getDynamicFieldObject(bankID ,"USDC", {idType: "0x1::string::String"});

  const tvl = assetBank.fields.value;
  api.add(ADDRESSES.sui.USDC, tvl);
  return api.getBalances()
}

module.exports = {
  sui: {
    tvl: suiTvl
  }
}