const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const config = {
  arbitrum: {
    owner: '0x6d00f6994f36ec1a3bd008dbbc84dfa46a939001',
    tokens: [
      nullAddress,
      '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    ]
  },
  optimism: {
    owner: '0x0b3c3dcf4c9db39b810f306e55cd14aed5c19c0b',
    tokens: [
      nullAddress,
      '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    ]
  }
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { owner, tokens, } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ tokens, owner, })
  }
})