const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: '0x0D97Fee619d955509e54B046c9992B6E9F5B0630', fetchCoValentTokens: true, tokenConfig: { onlyWhitelisted: false, }}),
  },
};

module.exports.deadFrom = '2023-07-09'