const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm');

const verse = "0xB72ab6f7177bBb41eFcC17D817778d77460259F1";
const staking = "0x3fb7931f7BFA9f318Fbf2346f568802a76531774";

const treasury = "0x623845e7961F7A2E535885F983a804608b69D026"
const treasuryTokens = [
    [ADDRESSES.avax.DAI, false], // DAI
    ["0xbf56ea8a64faf58889584930716e655317d22ea6", true] // VERSE-DAI
];

module.exports = {
    deadFrom: 1648765747,
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "avax", staking, verse, undefined, undefined, false)
}