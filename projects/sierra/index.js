const { ohmTvl } = require("../helper/ohm");

const token = "0x862D2E466C28dB7961E953083854e19481478842";
const tokenStaking = "0x3AcaFC2c652C7533bF2782F947FCB8d7A8Bb3913";
const treasury = "0x8eA72332670987463413916019e598040A8537Af";
const treasuryTokens = [
    ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // MIM
    ["0xCaC0101426fDbFCfE7baff17dDc6652D92540480", true] // SRA-MIM JLP
];

module.exports = {
    hallmarks: [
        [1648765747, "Rug Pull"]
    ],
    deadFrom: 1648765747,
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "avax", tokenStaking, token, undefined, undefined, false)
}
