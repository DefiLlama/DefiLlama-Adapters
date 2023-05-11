const { tombTvl } = require("../helper/tomb");

const sno = "0x1fE4869f2C5181b9CD780a7E16194FA2c4C4293D";
const snoshare = "0xe7A102Fbc8AB3581d62830DdB599eCCaae5e7875";
const boardroom = "0x264C36747b6cC5243d8999345FFf8F220B7CCc77";
const rewardPool = "0xb7d3dc568F7dF54d516D37739912Fc2E541Ba2fF";
const lps = [
    "0xe63b66a8cf7811525cd15dab15f17fb62aa5af2f", //joe/sno
    "0x3e262be2339069cec95552683c1eb3f513adcc66", //sno/snoshare
    "0x061349a57b702ebe3139ca419457bb23f7e0d8a2"
]

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(sno, snoshare, rewardPool, boardroom, lps, "avax")
}