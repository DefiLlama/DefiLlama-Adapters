const ADDRESSES = require('../helper/coreAssets.json')
const {ohmTvl} = require("../helper/ohm");

const treasury = "0xFb445ce1CFE11B86505dD293f1bE438fFaa4fF8c";
const treasuryTokens = [
    [ADDRESSES.bsc.DAI, false], // DAI
    [ADDRESSES.bsc.BUSD, false], // BUSD
    [ADDRESSES.bsc.WBNB, false], // WBNB
    ["0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", false], // CAKE
    [ADDRESSES.bsc.USDT, false], // USDT
    ["0xE119c951b68555d50eB6Aa54b5Cf0b854715CB2c", true], // ASGARD-WBNB CAKE LP
    ["0x11ceddd7a64ec79212d8ae9c8b46d23b8b750db0", true], // ASGARD-BUSD CAKE LP
    ["0xE5E926c8Ca7A44F7FFD900F5a88eA33E2B07162D", true] // ASGARD-DAI CAKE LP
];
const stakingAddress = "0xFdFC6a9717B33Ab43d066cFa686D0e374Cf2779b";
const stakingToken = "0xa5593837af2b99021fe657c80d70d2365F5CfD38";

module.exports = {
    ...ohmTvl(treasury, treasuryTokens, "bsc", stakingAddress, stakingToken)
}