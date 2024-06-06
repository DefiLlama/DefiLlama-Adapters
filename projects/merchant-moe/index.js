const { staking } = require("../helper/staking.js");
const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  mantle:{
    tvl: getUniTVL({ factory: '0x5bef015ca9424a7c07b68490616a4c1f094bedec' }),
    //staking: staking("0xE92249760e1443FbBeA45B03f607Ba84471Fa793", "0x4515A45337F461A11Ff0FE8aBF3c606AE5dC00c9")
  },
};