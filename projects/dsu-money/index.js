const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners: [
      [ADDRESSES.ethereum.USDC, '0xaef566ca7e84d1e736f999765a804687f39d9094'],
      [ADDRESSES.ethereum.USDC, '0xD05aCe63789cCb35B9cE71d01e4d632a0486Da4B'],
      ['0x39aa39c021dfbae8fac545936693ac917d5e7563', '0xD05aCe63789cCb35B9cE71d01e4d632a0486Da4B'],
    ]})
  },
  arbitrum: {
    tvl: sumTokensExport({ tokensAndOwners: [
      [ADDRESSES.arbitrum.USDC, '0x0d49c416103cbd276d9c3cd96710db264e3a0c27'],
      [ADDRESSES.arbitrum.USDC_CIRCLE, '0x0d49c416103cbd276d9c3cd96710db264e3a0c27'],
    ]})
  }
}
