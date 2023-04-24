const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: '0xFc7f884DE22a59c0009C91733196b012Aecb8F41', tokens: ['0xdac17f958d2ee523a2206206994597c13d831ec7']})
  }
}