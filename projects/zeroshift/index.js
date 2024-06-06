const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const zrst = "0xf436Ea4C4f2e49F0679895aEAE39dab698350eAa";
const stakingContract = "0xe41450704aB574968714b7548E9BcfF31A2183e0";
const treasury = "0x197123D62A2252c0Ac668a72BAAe39AF333843E0";
const treasuryTokens = [
    [ADDRESSES.avax.DAI, false], // DAI
    ["0xeebb1784296ad9f965e90e2cc3c4cf588daebc2d", true] // ZRST-DAI JLP
]

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "avax", stakingContract, zrst, undefined, undefined, false)
}