const { sumTokensExport } = require("../helper/unknownTokens");
const STAKING = [
  "0xBc4719D9F347EB1d9551d71862d2Cb4db99916f9",
  "0x4356c2d63e9376024e7E953e18cfC7125e643eE5",
  "0x6E8e3F4C058C5e0422E971CE27B0fc91175F4018",
  "0x77F7285d23ca4A9FdAe238d29a20a38482d9B4B7",
];
const LPS = ["0xf11A3f0EdB8D7B2ef36A4acDCf50D9214eC23FD1"];
const TOKENS = ["0x574f75bc522CB42ec2365dc54485D471f2eFb4B6"];
module.exports = {
  methodology:
    "First Crosschain Pool as a Service Miner. Twist to generate 10%/daily reward.",
  start: 35011373,
  bsc: {
    tvl: () => ({}),
    staking: sumTokensExport({
      owners: STAKING,
      tokens: TOKENS,
      lps: LPS,
      useDefaultCoreAssets: true,
    }),
  },
};
