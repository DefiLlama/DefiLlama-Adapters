const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");

const DATA_STORE_ID =
  "0x740d972ea066fe3302ee655163373cda2e9529bfa93d2266e1355cf56899da57";

const BLUE_VAULT_ID = "0xe567f041b313134fdd241c57cb10cfc5b54ca36cc91643308c34bbbafefd960a";
const BLUE_COIN = "0xe1b45a0e641b9955a20aa0ad1c1f4ad86aad8afb07296d4085e349a50e90bdca::blue::BLUE";

const USDC_VAULT_ID = "0x10d48e112b92c8af207c1850225284a7ca46bac1d935c4af4cf87ce29b121694";


async function suiTvl(api) {
  const object = await sui.getObject(DATA_STORE_ID);
  const usdc_vault_object = await sui.getObject(USDC_VAULT_ID);
  const vaultAmount = usdc_vault_object.fields.total_locked_amount;
  const bankID = object.fields.asset_bank.fields.id.id;
  const assetBank = await sui.getDynamicFieldObject(bankID ,"USDC", {idType: "0x1::string::String"});

  const tvl = assetBank.fields.value;
  api.add(ADDRESSES.sui.USDC, tvl);
  api.add(ADDRESSES.sui.USDC, vaultAmount);
  return api.getBalances()
}

const staking = async (api) => {
  const vaultObject = await sui.getObject(BLUE_VAULT_ID);
  const blueCoinAmount = vaultObject.fields.total_locked_amount;
  // div by 1e9 as blue coin has 9 precision
  api.add(BLUE_COIN, blueCoinAmount);
}

module.exports = {
  sui: {
    tvl: suiTvl,
    staking
  }
}