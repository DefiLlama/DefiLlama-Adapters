const { staking } = require("./helper/staking.js");

module.exports = {
  kava: {
    tvl: staking(
      "0xfc30fE377f7E333cC1250B7768107a7Da0277c44",
      "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b",
      "kava",
      "kava",
      18
    )
  }
};
