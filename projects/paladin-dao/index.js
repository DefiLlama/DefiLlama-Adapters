const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const token = "0xb4da413d7643000a84c5b62bfb1bf2077604b165";
const tokenStake = "0x7B73d56c53059699003ac11aF4308f6bEb4877FF";
const treasury = "0x6382192259f45a7acDa2A08cc30ce9FaF0e1863E";
const tokens = [
    [ADDRESSES.bsc.BUSD, false], // BUSD
    ["0x103900036e483c85ea4748b6733f621b8df21e2d", true] // PAL-BUSD
];

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, tokens, "bsc", tokenStake, token, undefined, undefined, false)
}