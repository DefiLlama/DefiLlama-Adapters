const { nullAddress, sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
        tokens:[nullAddress, "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "0xdac17f958d2ee523a2206206994597c13d831ec7"],
        owners: ["0xA8AB795731fbBFDd1Fbc57ca11e6f722e7783642"]
    })
  },
  arbitrum: {
    tvl: sumTokensExport({
        tokens:[nullAddress, "0x5979D7b546E38E414F7E9822514be443A4800529", "0xaf88d065e77c8cc2239327c5edb3a432268e5831", "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"],
        owners: ["0x475c4af369b28997b25bd756ef92797ad3f69593"]
    })
  }
}