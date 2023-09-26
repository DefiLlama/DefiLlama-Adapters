const sui = require('../helper/chain/sui')

async function suiTVL() {
  const stakingObjectID = '0x47b224762220393057ebf4f70501b6e657c3e56684737568439a04f80849b2ca'
  const { fields: staking } = await sui.getObject(stakingObjectID)
  console.log(staking)

  const suiAmount = +staking.total_staked + +staking.total_rewards - +staking.total_protocol_fees - 
    +staking.uncollected_protocol_fees - +staking.total_unstaked + +staking.unclaimed_sui_amount;

  return {
    sui: suiAmount / 1e9,
  }
}

module.exports = {
  sui: {
    tvl: suiTVL,
  }
}
