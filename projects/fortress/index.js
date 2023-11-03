const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0xb8e8d2E97C5F4594F65CCe0f5888C641C7A3a056";
module.exports = ohmTvl(treasuryAddress, [
  [ADDRESSES.avax.WAVAX, false],
  ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],
  ["0x3e5f198b46f3de52761b02d4ac8ef4ceceac22d6", true],
  ["0x2a91134162e2da1394df9e5e64608109d73ed3a0", true],
], "avax", "0x4D8ba74820e2d6EaD2Ea154586CB7dfbA8A691aa", "0xf6d46849db378ae01d93732585bec2c4480d1fd5", undefined, undefined, true)
