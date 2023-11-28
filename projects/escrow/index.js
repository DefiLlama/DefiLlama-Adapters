const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const contract = "0x2a412Df7e18B847e953c2Bc6ae90581dEe8571e3";

module.exports = {
  methodology: `We count the eth escrowed in ${contract}`,
  ethereum: {
    tvl: sumTokensExport({ owner: contract, tokens: [nullAddress]}),
  },
};
