const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  rsk: {
    tvl: sumTokensExport({ owner: '0x1440d19436bEeaF8517896bffB957a88EC95a00F', fetchCoValentTokens: true, tokenConfig: { useCovalent: true } }),
  }
};
