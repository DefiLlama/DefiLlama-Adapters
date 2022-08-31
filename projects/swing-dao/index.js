const { ohmTvl } = require("../helper/ohm");

const token = "0x19fbfa5987efecceff41b190759a9d883a4bea21";
const staking = "0x8d0d683f8030356C6f3dDD5Ed01372f82F8ce833";
const treasury = "0xeE9181EB5c49712d6be9905c369d0e605061f284";

module.exports = {
    deadFrom: 1648765747,
    misrepresentedTokens: true,
    ...ohmTvl(treasury, [
        ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // MIM
        ["0xad5bade2c8c6dcd0774581d29bb403d7b3d8194e", true] // GNIWS-MIM JLP
    ], "avax", staking, token, undefined, undefined, false)
}
