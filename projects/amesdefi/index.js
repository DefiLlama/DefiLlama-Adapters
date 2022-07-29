const { tombTvl } = require('../helper/tomb');

const ames = "0xb9E05B4C168B56F73940980aE6EF366354357009";
const share = "0xFa4b16b0f63F5A6D0651592620D585D308F749A4";
const boardroom = "0xC183b26Ad8C660AFa7B388067Fd18c1Fb28f1bB4";
const rewardPool = "0x1da194F8baf85175519D92322a06b46A2638A530";
const pool2lps = [
    "0x81722a6457e1825050B999548a35E30d9f11dB5c",
    "0x91da56569559b0629f076dE73C05696e34Ee05c1",
];

module.exports = {
    ...tombTvl(ames, share, rewardPool, boardroom, pool2lps, "bsc", undefined, false, pool2lps[1])
};