const ADDRESSES = require('../helper/coreAssets.json')
const { getSolBalanceFromStakePool } = require('../helper/solana')
const { queryDuneSql } = require('../helper/dune')

const POOL = '8VpRhuxa7sUUepdY3kQiTmX9rS5vx4WgaXiAnXq4KCtr'
const STAKE_POOL_PROGRAM = 'SPMBzsVUuoHA4Jm6KunbsotaahvVikZs1JyTW6iJvbn'
const WITHDRAW_AUTHORITY = 'EMjuABxELpYWYEwjkKmQKBNCwdaFAy4QYAs6W9bDQDNw'
const RESERVE_STAKE = 'FMAWbzuxsgbgndArunedwxXPA6sweaVUGGgadCpSxau2'

const startOfTodayUTC = () => {
  const d = new Date()
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000)
}

// Total SOL backing jupSOL on a given day = sum of the pool's stake-account balances
// (per-validator stakes added via the stake pool's AddValidatorToPool instruction, plus the
// reserve), carried forward to `date` from solana_utils.daily_balances (a daily snapshot table).
const historicalSql = (date) => `
  WITH pool_accounts AS (
    SELECT DISTINCT account_arguments[6] AS stake_account
    FROM solana.instruction_calls
    WHERE executing_account = '${STAKE_POOL_PROGRAM}'
      AND contains(account_arguments, '${WITHDRAW_AUTHORITY}')
      AND bytearray_substring(data, 1, 1) = 0x01   -- AddValidatorToPool
      AND tx_success
      AND CARDINALITY(account_arguments) > 6
    UNION
    SELECT '${RESERVE_STAKE}'
  ),
  latest AS (
    SELECT b.address, b.sol_balance,
           ROW_NUMBER() OVER (PARTITION BY b.address ORDER BY b.day DESC) AS rn
    FROM solana_utils.daily_balances b
    WHERE b.address IN (SELECT stake_account FROM pool_accounts)
      AND b.month <= DATE_TRUNC('month', DATE '${date}')
      AND CAST(b.day AS date) <= DATE '${date}'
  )
  SELECT COALESCE(SUM(sol_balance), 0) AS total_sol
  FROM latest
  WHERE rn = 1`

async function tvl(api) {
  // Historical (timetravel): RPC only exposes the pool account's current state, and the SOL backing
  // jupSOL lives across many rotating stake accounts. So for past dates we reconstruct the total from
  // the pool's stake-account balances.
  if (api.timestamp && api.timestamp < startOfTodayUTC()) {
    const date = new Date(api.timestamp * 1000).toISOString().slice(0, 10)
    const rows = await queryDuneSql(historicalSql(date))
    const sol = rows && rows[0] ? Number(rows[0].total_sol || 0) : 0
    if (sol) api.add(ADDRESSES.solana.SOL, Math.round(sol * 1e9))
    return
  }

  await getSolBalanceFromStakePool(POOL, api)
}

module.exports = {
  timetravel: true,
  methodology: 'Total SOL staked in the jupSOL stake pool. Current TVL is read on-chain from the stake pool account; historical TVL is reconstructed from the pool stake-account SOL balances',
  solana: {
    tvl
  }
}
