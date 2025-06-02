const {getLiquityTvl} = require('../helper/liquity')

module.exports = {
  methodology: "Deposited Matic and USDH, USDH is not listed on CoinGecko and has been replaced with TUSD",
  polygon:{
    tvl: getLiquityTvl("0xd8a3e8c70091d6231a63e671a6ce8ea44e143d24")
  }
};
