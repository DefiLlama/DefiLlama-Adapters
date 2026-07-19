const { PublicKey } = require('@solana/web3.js')
const { getConnection } = require('../helper/solana')

// bCOOK is the liquid staking token of Cookie Chain, built on the canonical SPL
// Stake Pool program. The StakePool account tracks `totalLamports` — the total
// native COOK under management across the reserve and all validator stake
// accounts — which is exactly the protocol's TVL. In the StakePool struct that
// u64 sits at offset 258 (after accountType + 8 pubkeys + withdrawBumpSeed).
const STAKE_POOL = new PublicKey('GxbNKNYdtNXQkhDkpHdLDAMX64GxaECgANqdfp6cUGH4')
const TOTAL_LAMPORTS_OFFSET = 258
const WRAPPED_COOK = 'So11111111111111111111111111111111111111112' // native COOK

async function tvl(api) {
  const connection = getConnection(api.chain)
  const acc = await connection.getAccountInfo(STAKE_POOL)
  if (!acc || acc.data.length < TOTAL_LAMPORTS_OFFSET + 8)
    throw new Error('bakeyourstake: stake pool account missing or malformed')
  const totalLamports = acc.data.readBigUInt64LE(TOTAL_LAMPORTS_OFFSET)
  api.add(WRAPPED_COOK, totalLamports.toString())
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the total native COOK staked in the bCOOK SPL stake pool, read as the StakePool account\'s totalLamports on Cookie Chain.',
  cookiechain: { tvl },
}
