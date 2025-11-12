const ADDRESSES = require('../helper/coreAssets.json')
const defaultVault = '0xF9775085d726E782E83585033B58606f7731AB18'
const extraVault = '0x84E5C854A7fF9F49c888d69DECa578D406C26800'

const fbtc0  = ADDRESSES.bob.FBTC
const fbtc1 = '0xd681C5574b7F4E387B608ed9AF5F5Fc88662b37c'

const config = {
  ethereum: {
    vault: '0x047D41F2544B7F63A8e991aF2068a363d210d6Da',
    tokens: [ADDRESSES['ethereum'].WBTC, fbtc0, fbtc1]
  },
  arbitrum: {
    vault: extraVault,
    tokens: [ADDRESSES['arbitrum'].WBTC]
  },
  mode: {
    vault: extraVault,
    tokens: [ADDRESSES['mode'].WBTC]
  },
  optimism: {
    vault: defaultVault,
    tokens: [ADDRESSES['optimism'].WBTC]
  },
  mantle: {
    vault: defaultVault,
    tokens: [fbtc0, fbtc1]
  },
  bob: {
    vault: '0x2ac98DB41Cbd3172CB7B8FD8A8Ab3b91cFe45dCf',
    tokens: [ADDRESSES['bob'].WBTC]
  },
  zeta: {
    vault: extraVault,
    tokens: [ADDRESSES['zeta'].BTC]
  },
  bsc: {
    vault: extraVault,
    tokens: [fbtc0, ADDRESSES['bsc'].BTCB]
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
