const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const fidl = "0x414a36a4b79Ee1D4b454AB798E4179ffC00b1641";
const fidlStaking = "0x2D1E126b0700D419f8B742118Fb4fa1dEc8c4a62";
const treasury = "0x282cBA0034b8Ce7394c0737F0571945e15Ed242E";
const treasuryTokens = [
    [ADDRESSES.bsc.BUSD, false], // BUSD
    ["0x08DBeFd8f7ACa80729267a84df012eA0f203cFa8", true] // FIDL-BUSD CAKE LP
];

module.exports = {
    hallmarks: [
        [1648684800, "Rug Pull"]
    ],
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "bsc", fidlStaking, fidl, undefined, undefined, false)
}