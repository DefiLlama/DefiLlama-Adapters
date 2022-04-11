const { tombTvl } = require("./helper/tomb");

const PES = "0x8EfBaA6080412D7832025b03B9239D0be1e2aa3B";
const SPES = "0xBBd4650EeA85f9DBd83d6Fb2a6E8B3d8f32FE1C5";
const boardroom = "0x7614A4CEB3ACdfCd4841D7bD76c30e7a401E83cd";
const rewardPool = "0xdd403db142a320261858840103b907c2486240c6";
const lps = [
    "0x43713f13a350d104319126c13cd7402822a44f6b",
    "0xadab84bf91c130af81d76be9d7f28b8c4f515367",
];
const shareLps = "0x72c1f5fb7e5513a07e1ff663ad861554887a0a0a";

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(PES, SPES, rewardPool, boardroom, lps, "cronos", a => `cronos:${a}`, false, shareLps)
};