const { stakings } = require('../helper/staking')

const stakingContracts = [
  '0x23445c63FeEf8D85956dc0f19aDe87606D0e19A9',
]
const xcnToken = '0xA2cd3D43c775978A96BdBf12d733D5A1ED94fb18'

module.exports = {
  ethereum: {
    staking: stakings(stakingContracts, xcnToken),
    tvl: async () => ({}),
  },
}
