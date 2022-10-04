const { ohmTvl } = require("../helper/ohm");

const treasury = "0xC06A7e21289E35eA94cE67C0f7AfAD4e972117D8";
const stakingContract = "0x2f6A0D592f7F24D71c4EcA815c94d43AbE190fc3";
const hexal = "0x57612d60b415ad812da9a7cf5672084796a4ab81";
const treasuryTokens = [
    ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false],
    ["0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", false],
    ["0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", false],
    ["0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3", false],
    ["0x55d398326f99059ff775485246999027b3197955", false],
    ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", false],
    ["0xc94364d0ffd3c015689f55e167ac359eb93c617e", true]
]

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "bsc", stakingContract, hexal, undefined, undefined, false)
}