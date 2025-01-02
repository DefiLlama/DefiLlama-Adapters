const ADDRESSES = require('./helper/coreAssets.json')
const { ohmTvl } = require("./helper/ohm");

const cat = "0x48358BfAA1EC39AafCb0786c3e0342Db676Df93E";
const stakingContract = "0x6636dF51544bAef6B90f4012504B1dfE1eD5e3Fd";
const treasury = "0x10243C6D13875443716ff3E88b7Da7664e431E09";
const treasuryTokens = [
    ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // MIM
    [ADDRESSES.avax.WAVAX, false], // WAVAX
    ["0x6a71044647c960afb6bbe758cc444dedfa9349f7", true] // CAT-MIM JLP
]   

module.exports = {
    deadFrom: 1648765747,
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "avax", stakingContract, cat)
}
