const {ohmTvl} = require("../helper/ohm");

const jolly = "0x30ff717fc266f2dcb3adc1af4043f8c517491e66";
const jollyStaking = "0xDd9a1371035a7483E77Ebb95903816D73DE1B2b4";
const treasury = "0x661eaa3754a78e223bdc470f32f8305bfe777112";
const treasuryTokens = [
    ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // MIM
    ["0x3ff63b999749ca19e254caade820ed73d580ec69", true], // JOLLY-MIM JLP
]
module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "avax", jollyStaking, jolly, undefined, undefined, false)
}