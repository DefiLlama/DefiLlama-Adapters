const { tombTvl } = require("../helper/tomb");

const sno = "0x9e6832d13b29d0b1c1c3465242681039b31c7a05";
const snoshare = "0x924157B5dbB387A823719916B25256410a4Ad470";
const boardroom = "0x264C36747b6cC5243d8999345FFf8F220B7CCc77";
const rewardPool = "0xb762Ece3Bc3571376BE73D2e6F3bBf4d108ED8b1";
const lps = [
    "0xE63b66A8CF7811525cd15daB15F17fb62aa5af2F",
    "0x061349a57b702ebE3139CA419457bb23f7e0D8A2"
]

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(sno, snoshare, rewardPool, boardroom, lps, "avax", undefined, false, lps[1])
}