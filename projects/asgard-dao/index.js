const {ohmTvl} = require("../helper/ohm");

const treasury = "0xFb445ce1CFE11B86505dD293f1bE438fFaa4fF8c";
const treasuryTokens = [
    ["0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3", false], // DAI
    ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false], // BUSD
    ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", false], // WBNB
    ["0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", false], // CAKE
    ["0x55d398326f99059ff775485246999027b3197955", false], // USDT
    ["0xE119c951b68555d50eB6Aa54b5Cf0b854715CB2c", true], // ASGARD-WBNB CAKE LP
    ["0x11ceddd7a64ec79212d8ae9c8b46d23b8b750db0", true], // ASGARD-BUSD CAKE LP
    ["0xE5E926c8Ca7A44F7FFD900F5a88eA33E2B07162D", true] // ASGARD-DAI CAKE LP
];
const stakingAddress = "0xFdFC6a9717B33Ab43d066cFa686D0e374Cf2779b";
const stakingToken = "0xa5593837af2b99021fe657c80d70d2365F5CfD38";

module.exports = {
    ...ohmTvl(treasury, treasuryTokens, "bsc", stakingAddress, stakingToken)
}