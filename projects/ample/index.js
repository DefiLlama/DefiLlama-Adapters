const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  base: {
    tvl: sumTokensExport({
      owner: "0x1688aeb3ec7b23a22e2418fdf5bccc67ecf39c0f",
      tokens: ["0x0a1a3b5f2041f33522c4efc754a7d096f880ee16"],
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owner: "0xd1be1f98991cf69355e468ad15b6d0b6429bcfcb",
      tokens: ["0x44c10da836d2abe881b77bbb0b3dce5f85c0c1cc"],
    }),
  },
  katana: {
    tvl: sumTokensExport({
      owner: "0xe5092ab6b8b0c37b1bec12c606614706063d04e8",
      tokens: ["0xE4248e2105508FcBad3fe95691551d1AF14015f7"],
    }),
  },
};
