const { tombTvl } = require("../helper/tomb");

const mvdollar = "0x35bED1E2f3033395a05CD0b1b5900209ECe42774";
const mshare = "0xb011EC534d9175cD7a69aFBfc1bcc9990862c462";
const rewardPool = "0x1D39015cEa46a977cC5752C05fF2Cb3c1a4038E7";
const masonry = "0x92c102Eab956c8d330709681AE74dc68815fC0bc";

const lps = [
    "0x35bED1E2f3033395a05CD0b1b5900209ECe42774",
    "0x92A7b2A9ca7D70573E3a0B0BF9e5232c70db8a89",
    "0x85E8DcBc11eF5C5F98277B20A041C8ab90E0e2f7"
];
//node test.js projects/miniversefinance/index.js
module.exports = {
    ...tombTvl(mvdollar, mshare, rewardPool, masonry, lps, "fantom")
}