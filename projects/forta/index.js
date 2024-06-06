const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  polygon: {
    tvl: () => 0,
    staking: sumTokensExport({ owner: '0xd2863157539b1d11f39ce23fc4834b62082f6874', tokens: ['0x9ff62d1fc52a907b6dcba8077c2ddca6e6a9d3e1'] })
  }
}