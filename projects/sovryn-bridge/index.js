const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: "0x33C0D33a0d4312562ad622F91d12B0AC47366EE1",
      fetchCoValentTokens: true,
      logCalls: true,
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owner: "0xdfc7127593c8Af1a17146893F10e08528F4C2AA7",
      fetchCoValentTokens: true,
      logCalls: true,
    }),
  },
};
