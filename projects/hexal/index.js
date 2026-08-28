const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const treasury = "0xC06A7e21289E35eA94cE67C0f7AfAD4e972117D8";
const stakingContract = "0x2f6A0D592f7F24D71c4EcA815c94d43AbE190fc3";
const hexal = "0x57612d60b415ad812da9a7cf5672084796a4ab81";
const treasuryTokens = [
    [ADDRESSES.bsc.BUSD, false],
    [ADDRESSES.bsc.USDC, false],
    ["0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", false],
    [ADDRESSES.bsc.DAI, false],
    [ADDRESSES.bsc.USDT, false],
    [ADDRESSES.bsc.WBNB, false],
    ["0xc94364d0ffd3c015689f55e167ac359eb93c617e", true]
]

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "bsc", stakingContract, hexal, undefined, undefined, false)
}