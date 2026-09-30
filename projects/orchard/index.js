const ADDRESSES = require('../helper/coreAssets.json')

const AAPL = '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9' // Apple stock token issued by Robinhood
const SEED = '0x5eED45d9cD4c21280db5b190D9c263f086401b9D' // Orchard's own token
const ORCHARD_V1 = '0xEbB8b167c0992cFdc497A995a8Cf7167acAA0A1A'
const ORCHARD_V2 = '0x86510b3df745C67a993A66CB08720Ed158d44549' // live since 2026-09-03; v1 stays open for claims
const SEED_STAKING = '0xd5d5f5Dff96E53fc6337b4aCf549d61b12882F2b'

const ORCHARD_V2_START = 1788476509 // v2 deployment

// Orchard is a 5x5 plot game played in AAPL. Two versions of the game contract run side by side.
//
// v1 swaps the ETH planted on a plot to AAPL inside the same transaction, so its whole balance
// is AAPL: the pot of rounds that have not been revealed yet, the Golden Apple jackpot, and
// every harvest share still unclaimed.
//
// v2 keeps the ETH planted on the open round (and any ETH players deposited for standing
// orders) as ETH until the keeper seals the round, when the whole round is swapped to AAPL at
// once. Its AAPL is the sealed pots, the jackpot, unclaimed harvest shares, player balances,
// and the slice of the claim juice reserved for v1 players who bridge their harvest over.
//
// In both, treasuryAccrued/adminAccrued are protocol-owned fees waiting to be swept, so they are
// subtracted. The staking contract, shared by both versions, holds the staker rake already
// flushed to it, also in AAPL.
async function tvl(api) {
  const v2Live = api.timestamp >= ORCHARD_V2_START
  const games = v2Live ? [ORCHARD_V1, ORCHARD_V2] : [ORCHARD_V1]

  const [held, treasury, admin, stakerRewards] = await Promise.all([
    api.multiCall({ abi: 'erc20:balanceOf', target: AAPL, calls: games }),
    api.multiCall({ abi: 'uint256:treasuryAccrued', calls: games }),
    api.multiCall({ abi: 'uint256:adminAccrued', calls: games }),
    api.call({ abi: 'erc20:balanceOf', target: AAPL, params: SEED_STAKING }),
  ])
  let userOwned = BigInt(stakerRewards)
  games.forEach((_, i) => {
    userOwned += BigInt(held[i]) - BigInt(treasury[i]) - BigInt(admin[i])
  })
  api.add(AAPL, userOwned.toString())

  // ETH planted on the open v2 round and ETH deposited by players, still waiting for the seal swap
  if (v2Live) await api.sumTokens({ owner: ORCHARD_V2, tokens: [ADDRESSES.null] })
}

// SEED staked for a share of the game's rake
const staking = async (api) => api.sumTokens({ owner: SEED_STAKING, tokens: [SEED] })

module.exports = {
  methodology:
    'TVL is the AAPL held by the two Orchard game contracts (v1 and v2) - the pot of rounds not ' +
    'yet revealed, the Golden Apple jackpot, every harvest share still unclaimed and, on v2, ' +
    'player balances and the juice reserved for v1 players bridging over - plus the ETH v2 holds ' +
    'for the open round and player deposits until the round is sealed and swapped to AAPL, plus ' +
    'the AAPL already flushed to the SeedStaking contract as staker rewards. Fees accrued to the ' +
    'treasury and to the admin are protocol-owned and are subtracted. Staking is the SEED staked ' +
    'in SeedStaking.',
  start: '2026-07-22',
  robinhood: { tvl, staking },
}
