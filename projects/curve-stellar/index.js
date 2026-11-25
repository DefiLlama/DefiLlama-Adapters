const { callSoroban } = require('../helper/chain/stellar')

// https://stellar.curve.finance/dex/stellar/pools
// StableSwap factory: every pool is registered under a permanent 0-based index
const FACTORY = 'CC2DWZ5RDSC5BZKEDQ5BABNUATX5EFJ4GCOENDXULEDVBHH2OKXFKYS5'

async function tvl(api) {
  const poolCount = Number(await callSoroban(FACTORY, 'pool_count'))
  for (let i = 0; i < poolCount; i++) {
    const registration = await callSoroban(FACTORY, 'pool_registration', [i]).catch(() => null)
    if (!registration?.pool) continue
    // active reserves owned by LPs, in coin order (uncollected protocol fees are kept apart in admin_balances)
    const balances = await callSoroban(registration.pool, 'get_balances').catch(() => null)
    if (!balances) continue
    registration.coins.forEach((coin, j) => api.add(coin, balances[j].toString()))
  }
}

module.exports = {
  timetravel: false,
  start: '2026-10-21',
  methodology: 'Token reserves of every pool deployed by the Curve StableSwap factory on Stellar, read from each pool contract. Uncollected protocol fees are not counted.',
  stellar: { tvl },
}
