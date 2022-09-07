const { ohmTvl } = require("../helper/ohm");

const treasuryAddress = "0x200a433086C37eB55bc4CD31f8195831052a67C6";
module.exports = ohmTvl(treasuryAddress, [
  ["0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f", false], // sOHM
  ["0x89c4d11dfd5868d847ca26c8b1caa9c25c712cef", true], // MNFST-OHM
  ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", false] // WETH
], "ethereum", "0x9c9022c6a2e1ed9f3110e177763123c4400d5eb6", "0x21585bbcd5bdc3f5737620cf0db2e51978cf60ac")
