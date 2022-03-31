const { ohmTvl } = require("../helper/ohm");

const sea = "0xb195af20a0fec7e2c95b22a1c5de86a2389e40d5";
const staking = "0x844e56e53839Dda19e85894C8e3C1c13d7Aa9463";
const treasury = "0x4db9Ca15EB32D205B7CD2927D5AE33924F4da22A";
const tokens = [
    ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // MIM
    ["0x4a99bca37a3e442ecc60ece9ae4d3bff3f9a423e", true] // SEA-MIM JLP
];

module.exports = {
    deadFrom: 1648765747,
    misrepresentedTokens: true,
    ...ohmTvl(treasury, tokens, "avax", staking, sea, undefined, undefined, false)
}
