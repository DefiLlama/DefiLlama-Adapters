const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const token = "0x3F46a70adB395cddb81FF9bFE3B62aDae1B44816";
const stakingContract = "0xA828eB4565819d3A134930CffbFD17f3bEE61F6a";
const treasury = "0x64a999BF3405f53074Fe5F89aCB09B5E9b35F5d7";
const treasuryTokens = [
    [ADDRESSES.polygon.DAI, false], // DAI
    ["0xa3fa99a148fa48d14ed51d610c367c61876997f1", false], // miMATIC
    ["0x2c9aed5b029dfd6b83c1214e528a276f41b8b527", true] // WARP-DAI SLP
]

module.exports = {
    ...ohmTvl(treasury, treasuryTokens, "polygon", stakingContract, token)
}