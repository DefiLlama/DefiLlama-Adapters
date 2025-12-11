const { getObject } = require("../helper/chain/sui");
const autoCompoundVaultObjectId =
    "0x65f38160110cd6859d05f338ff54b4f462883bb6f87c667a65c0fb0e537410a7";
const btcUSDCVaultObjectId =
    "0xf704715e61216b4912b4ed01dd60802f3c8e287b069996a9f65985988e47de77";
const TOKEN = {
  lakeUSDC: "0xb75744fadcbfc174627567ca29645d0af8f6e6fd01b6f57c75a08cd3fb97c567::lake_usdc::LakeUSDC",
  btcUSDC: "0x6d9fc33611f4881a3f5c0cd4899d95a862236ce52b3a38fef039077b0c5b5834::btc_usdc::BtcUSDC",
  USDC: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
}

function mappingTokenAsset(type){
  switch (type) {
    case TOKEN.lakeUSDC:
      return TOKEN.USDC;
    case TOKEN.btcUSDC:
      return TOKEN.USDC;
    default:
      return type;
  }
}

async function tvl(api) {
  
  const [autoCompoundVaultObject, btcUSDCVaultObject] = await Promise.all([
    getObject(autoCompoundVaultObjectId), 
    getObject(btcUSDCVaultObjectId),
  ])

  const lakeUSDCTvl = Number(autoCompoundVaultObject.fields.yield_usdb_balance) 
  const btcUSDCTvl = Number(btcUSDCVaultObject.fields.stake)

  api.add(mappingTokenAsset(TOKEN.lakeUSDC), lakeUSDCTvl);
  api.add(mappingTokenAsset(TOKEN.btcUSDC), btcUSDCTvl);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};