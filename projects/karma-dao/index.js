const { ohmTvl } = require("../helper/ohm");
const treasury = "0xAa50Ba30c9548cB34941C140e9CCe8Cc55829A71";
const treasuryTokens = [
    ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // mim
    ["0x6DB2bCcd11bb8dC29B7598dcf0D3d63cfb52A572", true], // karma-mim jlp
];
const karma = "0x5ccff6723f592c223e7b31c6872ba999a028653f";
const stakingcontract = "0x4c9b7D49C86220A91c0c8756940C7c27583dC5EB";

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "avax", stakingcontract, karma, undefined, undefined, false)
}