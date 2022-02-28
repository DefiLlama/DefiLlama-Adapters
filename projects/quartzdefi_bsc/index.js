const { tombTvl } = require("../helper/tomb");

const ashareTokenAddress = "0xFa4b16b0f63F5A6D0651592620D585D308F749A4";
const ames = "0xb9e05b4c168b56f73940980ae6ef366354357009";

const LPTokens = [
    "0x6f78a0d31adc7c9fb848850f9d2a40da5858ad03",
    "0x39846550Ef3Cb8d06E3CFF52845dF42F71Ac3851",
    "0x61503f74189074e8e793cc0827eae37798c2b8f7"
]

const aShareBoardroomAddress = "0xC183b26Ad8C660AFa7B388067Fd18c1Fb28f1bB4";

const ashareRewardPool = "0x1da194F8baf85175519D92322a06b46A2638A530";

module.exports = {
    ...tombTvl(ames, ashareTokenAddress, ashareRewardPool, aShareBoardroomAddress, LPTokens, "bsc", addr=>{
        if (addr.toLowerCase() === "0x36d53ed6380313f3823eed2f44dddb6d1d52f656") {
            return "harmony:0xfa4b16b0f63f5a6d0651592620d585d308f749a4"
        }
        return `bsc:${addr}`
    })
}