const { post } = require('../helper/http')

// Sozu: liquid staking on Dusk (https://sozu.fi). Users deposit DUSK into the pool contract and receive stDUSK; the
// pool stakes the DUSK through provisioners owned by its relayer contract
// (1cc415d05b1cfbf2583bf2e8a0e39b2c768d263ef92d6a21a4787f76c6afa924). The pool values stDUSK at
// (active stake + DUSK waiting in the pool) / stDUSK supply, and TVL is that same backing.
const NODE = 'https://nodes.dusk.network'
const POOL = '6fdfdc713a18fc6ca2ad20eb2b4a3305a935ef47d6a872d9a4df8bc9fd9d169e'
const SUBSTRATE = 'bc6f50f7404d098cdd1117b15dddab6f6f3dad01c5ce3c5ce9b68a8b60bc4c1d' // the pool's stake accounting
const TRANSFER = '0100000000000000000000000000000000000000000000000000000000000000' // Dusk's genesis transfer contract
const LUX_PER_DUSK = 1e9

/**
 * Calls a contract query on the Dusk node and reads the result as a u64.
 * Queries take and return rkyv bytes; both calls here return a little-endian u64.
 */
async function queryU64(contract, fn, args = Buffer.alloc(0)) {
  const data = await post(`${NODE}/on/contracts:${contract}/${fn}`, args, {
    responseType: 'arraybuffer',
    headers: { 'content-type': 'application/octet-stream' },
  })
  const bytes = Buffer.from(data)
  if (bytes.length !== 8) throw new Error(`sozu: ${fn} returned ${bytes.length} bytes, expected a u64`)
  return bytes.readBigUInt64LE()
}

/**
 * DUSK backing stDUSK: the pool's active stake plus the DUSK it holds that isn't staked yet.
 */
async function tvl(api) {
  const staked = await queryU64(SUBSTRATE, 'active_stake')
  const pending = await queryU64(TRANSFER, 'contract_balance', Buffer.from(POOL, 'hex'))
  api.addCGToken('dusk-network', Number(staked + pending) / LUX_PER_DUSK)
}

module.exports = {
  timetravel: false,
  methodology: 'DUSK backing stDUSK: the stake held by provisioners the Sozu pool controls (active_stake on its substrate contract) plus DUSK deposited in the pool contract and not yet staked.',
  dusk: { tvl },
}
