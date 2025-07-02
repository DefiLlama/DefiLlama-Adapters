const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const RWAToken = ADDRESSES.real.RWA
const veRWA = '0xa7B4E29BdFf073641991b44B283FD77be9D7c0F4'

module.exports = {
  misrepresentedTokens: true,
  real: {
    tvl: () => ({}),
    staking: staking(veRWA, RWAToken),
  }
}