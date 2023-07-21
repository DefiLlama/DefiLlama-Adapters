const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  mantle: {
    tvl: sumTokensExport({
      owner: '0x78B2fa94A94bF3E96fcF9CE965bed55bE49FA9E7',
      tokens: [
        '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111',
        '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE',
        '0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2',
        '0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8'
      ]
    }),
  }
}
