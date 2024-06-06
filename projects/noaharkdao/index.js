const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const nrk = "0x61a47034276eb993e1c5e67bf1375ad0a48f10f6";
const stakingContract = "0xe830a08D4A794DEDB03A0B46cA7BBC8468ADc47B";
const treasury = "0x64E5dd04123BFF64a9eD7fe5b902720E63C422F0";
const treasuryTokens = [
    [ADDRESSES.avax.DAI, false], // DAI
    ["0x790c840b774d8f02ebdad9ddb74331614b535cef", true] // NRK-DAI SLP
]

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "avax", stakingContract, nrk, undefined, undefined, false)
}