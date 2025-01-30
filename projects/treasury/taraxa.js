const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  tara: {
    tvl: async (api) => {
      return sumTokens2({ api, tokens: [nullAddress], owners: ['0x723304d1357a2334fcf902aa3d232f5139080a1b'] })
    }
  }
}
