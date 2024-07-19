const { staking } = require('../helper/staking')
const RWAToken = '0x4644066f535Ead0cde82D209dF78d94572fCbf14'
const veRWA = '0xa7B4E29BdFf073641991b44B283FD77be9D7c0F4'

module.exports = {
  misrepresentedTokens: true,
  real: {
    tvl: () => ({}),
    staking: staking(veRWA, RWAToken),
  }
}