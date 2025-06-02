const { tombTvl } = require("../helper/tomb");

const stomb = "0x9e6832d13b29d0b1c1c3465242681039b31c7a05";
const slot = "0x924157B5dbB387A823719916B25256410a4Ad470";
const masonry = "0x831B2Ab0f6f190536f4138Db00b03C3Bb1b5f12A";
const rewardPool = "0xb762Ece3Bc3571376BE73D2e6F3bBf4d108ED8b1";
const lps = [
    "0x75adad64d0cc5f7ec4b0b1dc078f7d8c5b24056f",
    "0x04fc1cec422792c2ca41671a24184834b433fc18"
]

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(stomb, slot, rewardPool, masonry, lps, "avax", undefined, false, lps[1])
}