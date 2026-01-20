const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  start: '2020-12-05', // 12/5/2020 00:00:00 utc
  ethereum: { tvl: sumTokensExport({ owner: '0x6fb8aa6fc6f27e591423009194529ae126660027', fetchCoValentTokens: true, tokens: ['0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9'] }) }
}