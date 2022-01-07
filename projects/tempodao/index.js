const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0x2af791E7EBa7efF93485CF8516bAf7bdc94d4db7";
module.exports = ohmTvl(treasuryAddress, [
//MIM
  ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],
//JOE LP
  ["0xfefb9b28f341d855b598e16ecc5f83b40cd827e6", true]
], "avax", "0x6323c227f71b30babdd6fe84093027079a955662", "0x88a425b738682f58c0ff9fcf2cceb47a361ef4cf" , undefined, undefined, false)