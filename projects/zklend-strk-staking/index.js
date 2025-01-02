const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require('../helper/chain/starknet')
const { strkStakingAbi } = require('./abi');

const stakingContract = '0x057ea05c22d6b162d0f2ef4b3d1e1edf3c065d81cf0f41950f716a71e9ad6bae'

async function tvl(api) {
  const stakedAmount = await call({ target: stakingContract, abi: strkStakingAbi.get_total_stake })
  api.add(ADDRESSES.starknet.STRK, stakedAmount)
}

module.exports = {
  methodology: 'The TVL is calculated as a sum of total STRK deposited into zkLend\'s staking contract',
  starknet: {
    tvl,
  },
}
