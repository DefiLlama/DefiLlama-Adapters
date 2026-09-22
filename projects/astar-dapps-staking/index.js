const { getStorage, decodeCompact } = require('../helper/chain/substrate')

// DappStaking.CurrentEraInfo: EraInfo { total_locked: Compact<Balance>, unlocking: Compact<Balance>, current_stake_amount, next_stake_amount }
async function tvl() {
  const eraInfo = await getStorage('astar_substrate', { pallet: 'DappStaking', item: 'CurrentEraInfo' })
  const totalLocked = decodeCompact(eraInfo).value
  return { astar: Number(totalLocked) / 1e18 }
}

module.exports = {
  timetravel: false,
  methodology:
    "Total value locked is the total amount of ASTR tokens deposited to the dApp Staking program",
  astar: { tvl },
}
