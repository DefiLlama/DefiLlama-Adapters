const { tombTvl } = require("../helper/tomb");

const code7 = "0xF77864FCFfeC4598813E3378681c9330B771cA88";
const sevenshare = "0xB215014176720EdA5334df07f827c3f11ec0f1bD";
const rewardPool = "0x42cd7c105cdc5c85d2ba1e57f7c74cb96f95e549";
const masonry = "0x39990bf6889ec7481ed021c11210b09d29c1c2ea";

const lps = [
    "0x25d6e427e0db1594156f1d4f334f62184555332e",
    "0xd4996a8654cf4cd319fc82e70430e4704f6e55d5"
];

module.exports = {
    ...tombTvl(code7, sevenshare, rewardPool, masonry, lps, "fantom", undefined, false, lps[0])
}