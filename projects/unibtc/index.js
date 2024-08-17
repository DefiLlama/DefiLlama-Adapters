const ADDRESSES = require('../helper/coreAssets.json')
const defaultVault = '0xF9775085d726E782E83585033B58606f7731AB18'

const config = {
  ethereum: {
    vault: '0x047D41F2544B7F63A8e991aF2068a363d210d6Da',
    tokens: [ADDRESSES['ethereum'].WBTC, '0xc96de26018a54d51c097160568752c4e3bd6c364']
  },
  optimism: {
    vault: defaultVault,
    tokens: [ADDRESSES['optimism'].WBTC]
  },
  mantle: {
    vault: defaultVault,
    tokens: ['0xC96dE26018A54D51c097160568752c4E3BD6C364']
  },
  bsquared: {
    vault: defaultVault,
    tokens: [ADDRESSES.null,ADDRESSES['bsquared'].WBTC]
  },
  merlin: {
    vault: defaultVault,
    tokens: [ADDRESSES.null,ADDRESSES['merlin'].WBTC,ADDRESSES['merlin'].WBTC_1]
  },
  btr: {
    vault: defaultVault,
    tokens: [ADDRESSES.null, ADDRESSES['btr'].WBTC]
  },
}

const tvl = (chainConfig) => {
  return async (api) => {
    return api.sumTokens({ tokens: chainConfig.tokens, owner: chainConfig.vault })
  }
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: tvl(config[chain])
  }
})
