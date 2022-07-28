const { tombTvl } = require("../helper/tomb");

const emp = "0x3b248CEfA87F836a4e6f6d6c9b42991b88Dc1d58";
const eshare = "0xDB20F6A8665432CE895D724b417f77EcAC956550";
const masonry = "0xe9baceea645e8be68a0b63b9764670f97a50942f";
const rewardPool = "0x97a68a7949ee30849d273b0c4450314ae26235b1";
const lps = [
    "0x1747AF98EBF0B22d500014c7dd52985d736337d2", // ESHARE-BNB LP 
    "0x84821bb588f049913Dc579Dc511E5e31EB22d5E4", // EMP-ETH LP
]

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(emp, eshare, rewardPool, masonry, lps, "bsc", undefined, true, lps[1])
}