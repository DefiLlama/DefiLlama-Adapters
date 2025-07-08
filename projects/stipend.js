const ADDRESSES = require('./helper/coreAssets.json')
const { staking } = require("./helper/staking.js");

module.exports = {
  kava: {
    tvl: staking(
      "0xfc30fE377f7E333cC1250B7768107a7Da0277c44",
      ADDRESSES.kava.WKAVA,
    )
  }
};
