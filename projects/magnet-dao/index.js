const { ohmTvl } = require("../helper/ohm");

const token = "0x1d60109178C48E4A937D8AB71699D8eBb6F7c5dE";
const staking = "0x587CB56D9d52C80267ca36c774eCECA98dEEc831"
const treasury = "0xD5310653Bf047503d30178CF4732BFfE3F2A4CD0";
const treasuryTokens = [
    ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // MIM
    ["0xd66b92fd29a6e1f9a1ccb8075a88d955fa4a409d", true] // MAG-MIM JLP
]

module.exports = {
    ...ohmTvl(treasury, treasuryTokens, "avax", staking, token)
}