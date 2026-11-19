const { getStorage, encodeU32, ScaleReader, decodeUint } = require('../helper/chain/substrate')

const POLYX_DECIMALS = 1e6

async function tvl(api) {
  // TVL = total amount bonded in staking (POLYX)
  // Staking.ActiveEra: ActiveEraInfo { index: u32, start: Option<u64> }
  const activeEra = new ScaleReader(await getStorage('polymesh', { pallet: 'Staking', item: 'ActiveEra' })).u32()
  // Staking.ErasTotalStake: map Twox64Concat EraIndex => Balance
  const total = decodeUint(await getStorage('polymesh', { pallet: 'Staking', item: 'ErasTotalStake', key: encodeU32(activeEra) }))
  api.addCGToken("polymesh", Number(total) / POLYX_DECIMALS)
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts total staked POLYX on Polymesh using the staking pallet erasTotalStake for the active era.",
  polymesh: { tvl },
}
