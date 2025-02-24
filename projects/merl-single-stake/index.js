const { staking } = require('../helper/staking')
const MERL_SINGLE_STAKE_CONTRACT = '0x641485BE8efb0a13F151c9C324f3681907f10d59'
const MERL_TOKEN = '0x5c46bFF4B38dc1EAE09C5BAc65872a1D8bc87378'

module.exports = {
  merlin: {
    tvl: staking([MERL_SINGLE_STAKE_CONTRACT,], MERL_TOKEN),
    staking: staking([MERL_SINGLE_STAKE_CONTRACT,], MERL_TOKEN),
  }
}