const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0x71EF2894E23D7ea7Fd73a3558B3a0bA25689bC86";
module.exports = ohmTvl(treasuryAddress, [
//DAI
  [ADDRESSES.polygon.DAI, false],
//FRAX
  ["0x104592a158490a9228070e0a8e5343b499e125d0", false],
//SSX
  ["0x9e2d266d6c90f6c0d80a88159b15958f7135b8af", false] ,
//Sushi LP
  ["0xc16e382aa7353aad0f598856afd9a93513542970", true]
], "polygon", "0x99bbc86E1f5447cf1908b27CEd0D2a0B9aA5efb2", "0xAC63686230f64BDEAF086Fe6764085453ab3023F", undefined, undefined, false)
