const { ohmTvl } = require("../helper/ohm");

const mino = "0x3A1138075bd97a33F23A87824b811146FA44288E";
const staking = "0x844e265F24868F7e18D4f90d50b500c6C36bdBA7";
const treasury = "0x8A8cc2F5346b3C95EE343c62F89f41E0c1b68C7b";
const tokens = [
    ["0xe6052a9a4c0a2f14adc9876a3a1a7b2882f5f139", false], // xUSD
    ["0xf2001b145b43032aaf5ee2884e456ccd805f677d", false], // DAI
    ["0xf5a5f547612e95c688971fb68334a80ceb3c542b", true], // MINO-DAI
    ["0x1c139f4b953ce0c0f6aa1cd1755727ad5aba5080", true], // MINO-WCRO
    ["0x062e66477faf219f25d27dced647bf57c3107d52", false], // WBTC
    ["0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23", false], // WCRO
    ["0xe44fd7fcb2b1581822d0c862b68222998a0c299a", false] // WETH
];

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, tokens, "cronos", staking, mino, addr=>{
        if (addr.toLowerCase() === "0xe6052a9a4c0a2f14adc9876a3a1a7b2882f5f139") {
            return "0x0000000000085d4780b73119b644ae5ecd22b376"
        }
        return `cronos:${addr}`
    }, undefined, false)
}