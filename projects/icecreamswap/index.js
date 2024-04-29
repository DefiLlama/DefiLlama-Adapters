const { getUniTVL, } = require('../helper/unknownTokens')

const config = {
  shimmer_evm: '0x24cb308a4e2F3a4352F513681Bd0c31a0bd3BA31',
}

const chains = [...Object.keys(config), 'base', 'telos', 'core', 'dogechain', 'fuse', 'xdc', 'bitgert', 'scroll', 'neon_evm', 'blast' ]

chains.forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory: factory ?? '0x9E6d21E759A7A288b80eef94E4737D313D31c13f', useDefaultCoreAssets: true,})
  }
})
