const { tombTvl } = require("../helper/tomb");

const dibs = "0xfd81ef21ea7cf1dc00e9c6dd261b4f3be0341d5c";
const dshare = "0x26d3163b165be95137cee97241e716b2791a7572";
const rewardPool = "0x8f75dfc6a598b00cc18edce9e458451f3742007d";
const masonry = "0xf65c374a91f47f8732a86acc49c74df4db8b2f1f";

const lps = [
    "0x9bebe118018d0de55b00787b5eeabb9eda8a9e0a",
    "0x5998af8868e5e4fbd7c60da221b76b201e441612"
];

module.exports = {
    ...tombTvl(dibs, dshare, rewardPool, masonry, lps, "bsc")
}