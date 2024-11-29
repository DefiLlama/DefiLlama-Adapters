const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require('../helper/chain/starknet')
const { strkStakingAbi } = require('./abi');

const stakingContract = '0x00ca1702e64c81d9a07b86bd2c540188d92a2c73cf5cc0e508d949015e7e84a7'

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
