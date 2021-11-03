const {getLiquityTvl} = require('../helper/liquity')

//USDH TOKEN ADDRESS ON POLYGON MAINNET
const USDH_TOKEN_ADDRESS = "0x92B27abe3C96d3B1266f881b3B0886e68645F51F";

module.exports = {
  methodology: "USDH replaced with TUSD",
  polygon:{
    tvl: getLiquityTvl("0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", USDH_TOKEN_ADDRESS,
      "0x5668f18f99c8767e7c7d8ffe6aec1d70bc2f1d50", "0xd8a3e8c70091d6231a63e671a6ce8ea44e143d24", "polygon", true)
  }
};
