const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0x3C8e800B9f12771A5f150D0943De968ABc7A7bE1";
module.exports = ohmTvl(treasuryAddress, [
//MIM
  ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],
//USDT.e
  ["0xc7198437980c041c805a1edcba50c1ce5db95118", false],
//wAVAX
  ["0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", false],
//JOE LP
  ["0xa03a99cd3d553fe9ebbccecabcb8c47100482f72", true] ,
//JOE LP
  ["0x29828626ca711b0e13de1031aae1f5423100e642", true]
], "avax", "0x3875AC1F19E05813000F02414b3141DC3Ff991B6", "0x70b33ebC5544C12691d055b49762D0F8365d99Fe" )