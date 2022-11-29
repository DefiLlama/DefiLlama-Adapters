const { ohmTvl } = require("../helper/ohm");

const tpd = "0xd0253dbe5606c9fa01db67eb10be5c3675c2b117";
const tpdStaking = "0xAeab776bE63580cB86309CedB49769e6526abbf4";
const treasury = "0x3287f25f8F29e5d65cE566E5a2a1bd336431d8db";
const treasuryTokens = [
    ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false], // BUSD
    ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", false], // WBNB
    ["0x50bc855ad6a3983589927e5bf3ac0688364ffa64", true] // TPD-BUSD CAKE LP
];

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "bsc", tpdStaking, tpd, undefined, undefined, false)
}