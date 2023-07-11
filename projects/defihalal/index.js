const ADDRESSES = require('../helper/coreAssets.json')
const {getLiquityTvl} = require('../helper/liquity')

//USDH TOKEN ADDRESS ON POLYGON MAINNET
const USDH_TOKEN_ADDRESS = "0x92B27abe3C96d3B1266f881b3B0886e68645F51F";

module.exports = {
  methodology: "Deposited Matic and USDH, USDH is not listed on CoinGecko and has been replaced with TUSD",
  polygon:{
    tvl: getLiquityTvl(ADDRESSES.polygon.WMATIC_2, "0xd8a3e8c70091d6231a63e671a6ce8ea44e143d24", "polygon")
  }
};
