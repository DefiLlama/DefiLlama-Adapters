const { ohmTvl } = require("../helper/ohm");

const ara = "0x2ced20fdfcbe72c27a607d0c9ab1c9ada598c60f";
const stakingContract = "0x19672375464ccbf1f8c6c7c32d8d8987d27262a5";
const treasuryContract = "0x674969110CA4004A804eeA5043CD9302996900AC";

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasuryContract, [
        ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // MIM
        ["0x9dd1cde570b96ba13e63d317e23637651142227c", true] // araMimJLP
    ], "avax", stakingContract, ara, undefined, undefined, false)
}