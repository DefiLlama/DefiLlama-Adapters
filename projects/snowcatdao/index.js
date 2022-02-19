const {ohmTvl} = require("../helper/ohm");

const scat = "0x2558b8FBa8f678Fd3029C927CD3780f5d3C266C7";
const scatStaking = "0x2466A2042236ece30de125594D7775143A845551";
const treasuryContract = "0x9B24eF0Ebe7C2Df748376469073968Ae7062d9C9";

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasuryContract, [
        ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // MIM
        ["0x65a607bd82e48eed640a314a1a26137b62ad6204", true] // scatMimJLP
    ], "avax", scatStaking, scat, addr=>`avax:${addr}`, undefined, false)
}