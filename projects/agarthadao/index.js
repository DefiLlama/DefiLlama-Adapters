const ADDRESSES = require('../helper/coreAssets.json')
const {ohmTvl} = require("../helper/ohm");

const clavis = "0xa5b0f5ef809fd04c9d4320211c711cb34ef812dd";
const stakingContract = "0x7e4939ca7847ae3ff9501b27470dcd0a69f54fa6";

const treasury = "0x2c5bb99df3d43efd98ff1d7aa34d4207c83638e4"
const treasuryTokens = [
    ["0x130966628846bfd36ff31a822705796e8cb8c18d", false],// MIM
    [ADDRESSES.avax.WAVAX, false], // WAVAX
    ["0x72f95Da8d7a9b405191cAE0Fc31711d575044eFb", true], // CLAVIS-MIM JLP
    ["0x7d5b42704bb34c5bbbcd3be4f5762a663b38a2df", true] // CLAVIS-WAVAX JLP
]

module.exports = {
    ...ohmTvl(treasury, treasuryTokens, "avax", stakingContract, clavis)
}