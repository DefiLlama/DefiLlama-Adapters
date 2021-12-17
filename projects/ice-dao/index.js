const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0x4f3340A84e610Fb3030E6cE5081804BdD8D7532A";
module.exports = ohmTvl(treasuryAddress, [
//MIM
  ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],
//JOE LP
  ["0xfefb9b28f341d855b598e16ecc5f83b40cd827e6", true]
], "avax", "0x82eeefe5cc8ad478893b377327ef2b710c51059f", "0x9235b893a3e61a14b2d02a91ec1394fbf411689e")