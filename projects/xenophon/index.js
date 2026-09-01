const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const xph = "0x3e29633846E8b857B7f6d7f293F895186804264b";
const treasury = "0x4b69C32450cE85d76aC94215fb81C21B434696eA";
const staking = "0xE90afe3349E42f416406c592f4B7192265085695";
const treasurytokens = [
    [ADDRESSES.bsc.BUSD, false], // BUSD
    ["0x5866d1032b5b6001429Bf2A47B830bDC0DD138EA", true] // XPH-BUSD CAKE LP
]

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasurytokens, "bsc", staking, xph, undefined, undefined, false)
}