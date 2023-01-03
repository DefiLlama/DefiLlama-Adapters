const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  avax:{
    tvl: sumTokensExport({
      chain: 'avax',
      owner: '0xad68ea482860cd7077a5d0684313dd3a9bc70fbb',
      tokens: [
        '0xc7198437980c041c805a1edcba50c1ce5db95118',
        '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
        '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
        '0x130966628846bfd36ff31a822705796e8cb8c18d',
        '0x78ea17559b3d2cf85a7f9c2c704eda119db5e6de',
        '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
        '0xc38f41a296a4493ff429f1238e030924a1542e50',
        '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
      ]
    })
  },
}