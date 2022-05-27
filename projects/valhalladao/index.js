const { ohmTvl } = require("../helper/ohm");

const valdao = "0x84506992349429dac867b2168843ffca263af6e8";
const stakingContract = "0xfe036c9a04153e60e972c6f46a141fb2e6a6ce48";
const treasuryContract = "0xecd81dfc5a86dd7ffbbe50b8f4ad219950700aa4";

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasuryContract, [
        ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // MIM
        ["0x34bfdf840a57f81f8b36a683fa6124d52e104c53", true], // valdaoMimJLP
    ], "avax", stakingContract, valdao, undefined, undefined, false)
}