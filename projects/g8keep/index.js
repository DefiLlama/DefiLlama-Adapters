const { getLogs2 } = require('../helper/cache/getLogs')
const { sumUnknownTokens } = require('../helper/unknownTokens')

const config = {
  base: { factory: '0x3C0B43867Cd04fEdfD6a95497e5ea7e3aFF8cCaE', fromBlock: 21977940 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event TokenDeployed (address indexed token, address indexed pair, address indexed deployer, string symbol)', fromBlock, })
      const tokens = logs.map(log => log.pair)
      return sumUnknownTokens({api, owner: factory, tokens, useDefaultCoreAssets: true, lps: tokens})
    }
  }
})

module.exports.doublecounted = true
module.exports.misrepresentedTokens = true