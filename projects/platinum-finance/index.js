const { tombTvl } = require("../helper/tomb");

const token = "0xDf15d33875AcF462a8746BF99396F6cCD50E0fFe";
const share = "0x32D50718bB7813C248ff4891d307EaB6964e965e";
const masonry = "0x78996E5F9F486D44f74a6896fDD8D7e21780d86a";
const rewardPool = "0xe39735d9741cbf0b8824a196a5bcb3d729153702";
const pool2s = [
    "0x9ef3a25c3993a242c229a22c8ab5b3376809137e",
    "0x7abcbf6e6f6e2e70065a2bc71b11892327ea5343"
]


module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(token, share, rewardPool, masonry, pool2s, "fantom", undefined, false, pool2s[1])
}