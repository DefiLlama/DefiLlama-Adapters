const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0xd069c8c4aD8CCE7076BdD1dca8AA9199dC980Ea8";
module.exports = ohmTvl(treasuryAddress, [
//MIM
  ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],
//JOE LP
  ["0x720dd9292b3d0dd78c9afa57afd948c2ea2d50d8", true],
// WAVAX
  [ADDRESSES.avax.WAVAX, false]
], "avax", "0x6323c227f71b30babdd6fe84093027079a955662", "0x88a425b738682f58c0ff9fcf2cceb47a361ef4cf")