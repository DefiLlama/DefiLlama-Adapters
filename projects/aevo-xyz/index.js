const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: '0x4082C9647c098a6493fb499EaE63b5ce3259c574', tokens: ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48']})
  }
}