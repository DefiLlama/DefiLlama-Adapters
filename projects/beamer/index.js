const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const config = {
  arbitrum: {
    owner: '0x6d00f6994f36ec1a3bd008dbbc84dfa46a939001',
    tokens: [
      nullAddress,
      ADDRESSES.arbitrum.USDC,
      ADDRESSES.optimism.DAI,
    ]
  },
  optimism: {
    owner: '0x0b3c3dcf4c9db39b810f306e55cd14aed5c19c0b',
    tokens: [
      nullAddress,
      ADDRESSES.optimism.USDC,
      ADDRESSES.optimism.DAI,
    ]
  }
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { owner, tokens, } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ tokens, owner, logCalls: true })
  }
})