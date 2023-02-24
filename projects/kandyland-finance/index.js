const { ohmTvl } = require("../helper/ohm");

const kandy = "0x37ded665a387a6f170fb60376b3057f09df6c0ea";
const stakingContract = "0x0AFaBaba220CD10C50A192bd382D06ebB98fAaf2";
const treasury = "0xb1CE95694E02126BEeE66bD6614410cA27C00a5e";
const tokens = [
    ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // MIM
    ["0x7DEABc1670da88BbC050A9858aCDDE30AEEDcCac", true] // KANDY-MIM JLP
]

module.exports = {
    deadFrom: 1648765747,
    ...ohmTvl(treasury, tokens, "avax", stakingContract, kandy, undefined, undefined, false)
}