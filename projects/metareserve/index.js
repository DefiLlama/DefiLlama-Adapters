const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const power = "0x000c6322Df760155bBe4F20F2EDD8F4Cd35733A6";
const staking = "0x5c643737AF2aD7A0B9ae62158b715793505967bE";
const treasury = "0x6651BDeE6A47F6962C86d680b498DC492a7E78C8";
const treasuryTokens = [
    [ADDRESSES.bsc.BUSD, false], // BUSD
    ["0xA1A64b7D85B92A19fdb628557cC44bCb40284B65", true] // POWER-BUSD
];

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "bsc", staking, power, undefined, undefined, false)
}