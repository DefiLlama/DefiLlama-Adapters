const { sumTokens2 } = require('../helper/unwrapLPs')

const VERIO_IP_STAKE_POOL = '0xf6701A6A20639f0E765bA7FF66FD4f49815F1a27'
const VERIO_IP_ASSET_STAKING = '0xe9be8e0Bd33C69a9270f8956507a237884dff3BE'

async function tvl(api) {
  const res = await Promise.all([
    api.call({ abi: 'uint256:getTotalStake', target: VERIO_IP_STAKE_POOL }),
    api.call({ abi: 'uint256:getStakePoolAmount', target: VERIO_IP_STAKE_POOL }),
    api.call({ abi: 'uint256:getTotalStakePricedInIP', target: VERIO_IP_ASSET_STAKING })
  ])
  api.addGasToken(res)
  return sumTokens2({ api })
}

module.exports = {
  methodology: 'TVL is the sum of the total stake in the Verio IP Stake Pool and the total stake weighted in IP in the Verio IP Asset Staking contract',
  sty: {
    tvl
  }
}