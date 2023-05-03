const { staking } = require('../helper/staking')

const wwemix = '0x7D72b22a74A216Af4a002a1095C8C707d6eC1C5f'
const stakingContract = '0x6F3f44B0Cf7C751f2a44Faf6bFdd08e499Eb0973'

module.exports = {
  wemix: {
    tvl: () => ({}),
    staking: staking(stakingContract, wwemix),
  },
}