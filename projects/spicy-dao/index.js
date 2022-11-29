const {ohmTvl} = require("../helper/ohm");

const spc = "0x6007fca39b5398feac4d06d75435a564a086bab8"
const spcStaking = "0xE1F2C6D1194eA9bfd532b66de7066944600cC58E";
const treasury = "0xb0E70A60bec6699a85681Fb7AECeF35A8800da6E";
const spcMimPGL = "0x910fA8fcd781AcCaa82CD544Ac235Ba921927494";
const mim = "0x130966628846bfd36ff31a822705796e8cb8c18d";

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, [
        [spcMimPGL, true],
        [mim, false]
    ], "avax", spcStaking, spc, undefined, undefined, false)
}