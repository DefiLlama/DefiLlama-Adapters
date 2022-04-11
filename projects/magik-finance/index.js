const { tombTvl } = require("../helper/tomb");

const magik = "0x87a5c9b60a3aaf1064006fe64285018e50e0d020";
const mshare = "0xc8ca9026ad0882133ef126824f6852567c571a4e";
const masonry = "0xac55a55676657d793d965ffa1ccc550b95535634";
const rewardPool = "0x38f006eb9c6778d02351fbd5966f829e7c4445d7";
const pool2LPs = [
    "0xdc71a6160322ad78dab0abb47c7a581cfe9709ee",
    "0x392c85ceccf9855986b0044a365a5532aec6fa31"
]

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(magik, mshare, rewardPool, masonry, pool2LPs, "fantom", undefined, false, pool2LPs[1])
}