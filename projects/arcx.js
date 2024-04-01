const stakingContract = '0x9bffad7a6d5f52dbc51cae33e419793c72fd7d9d'
const ARCx = '0x1321f1f1aa541a56c31682c57b80ecfccd9bb288'
const { staking } = require('./helper/staking')

module.exports = {
  methodology: "ARCx can be staked in the protocol",
  ethereum: {
    staking: staking(stakingContract, ARCx),
    tvl: () => ({})
  },
}
