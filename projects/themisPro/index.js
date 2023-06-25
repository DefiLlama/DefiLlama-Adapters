const { ohmTvl } = require("../helper/ohm");
const ADDRESSES = require('../helper/coreAssets.json')


const token = "0x005E02A4A934142d8Dd476F192d0dD9c381b16b4";//THS
const staking = "0xA8a3136111ca0b010C9FD5C2D6d7c71e4982606A"
const treasury = "0x0e511806C7AC38cF6d1EeAa9Ee51027e44Dcbf94";
const treasuryTokens = [
    [ADDRESSES.filecoin.USDT, false], // USDT
    ["0x45680718F6BdB7Ec3A7dF7D61587aC7C3fB49d50", true] // THS-USDT LP
]

module.exports = {
    ...ohmTvl(treasury, treasuryTokens, "filecoin", staking, token)
}