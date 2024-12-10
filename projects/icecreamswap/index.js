const { getUniTVL, } = require('../helper/unknownTokens')

const config = {
  shimmer_evm: '0x24cb308a4e2F3a4352F513681Bd0c31a0bd3BA31',
  bob: '0x7b2a5C88AB9367147F6ac384F857CbaDF5aA70a7',
  lightlink_phoenix: '0xC87De04e2EC1F4282dFF2933A2D58199f688fC3d',
  taiko: '0xC87De04e2EC1F4282dFF2933A2D58199f688fC3d'
}

const chains = [...Object.keys(config), 'base', 'telos', 'core', 'dogechain', 'fuse', 'xdc', 'bitgert', 'scroll', 'neon_evm', 'blast' ]

chains.forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory: factory ?? '0x9E6d21E759A7A288b80eef94E4737D313D31c13f', useDefaultCoreAssets: true,})
  }
})
