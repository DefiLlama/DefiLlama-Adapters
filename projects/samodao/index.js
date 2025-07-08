const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");


const token = "0xcd7CBc46d083A245B45E22Cb4bE2c569947Ce896";
const tokenStaking = "0x082e884e640eC62C67ea3dC791793E4dF2C46c2D";
const treasury = "0xBB575FbDd418E9e8405D97A33043818A379CD2Ca";
const treasurytokens = [
    [ADDRESSES.bsc.BUSD, false], // BUSD
    ["0x4a49858B15F934306725B32582FFa55f95D9F90a", true] // CAKE LP (samoDAO-BUSD)
]

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasurytokens, "bsc", tokenStaking, token, undefined, undefined, false)
}