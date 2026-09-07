const ethers = require('ethers')
const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

// Shroom is a Robinhood Chain memecoin backed by liquidity that cannot be pulled out from under the
// token. That comes in two forms, which this adapter counts together as TVL but which are NOT the
// same thing:
//
//  1. Protocol owned liquidity -- positions the team itself owns and manages, pairing SHROOM against
//     MU, tokenized equities (NVDA/META/MSFT/AAPL/SPY/TSLA/...) and other memecoins. LP fees from
//     these are recycled into deepening the pools, buybacks and burns. This is the POL proper.
//  2. The locked launch liquidity in the canonical SHROOM/MU pool. Pons locked this at launch and
//     nobody, the team included, can withdraw it. It is NOT protocol owned liquidity -- the team does
//     not own it -- but it is permanently committed to backing SHROOM, so it is protocol TVL.
//
// All of it is Uniswap V4 -- there is no v3 position, no v2 pair and no other DEX.
const SHROOM = '0xab093def657f15df31b33922a95e047add645b29'
// Uniswap V4 PositionManager on this chain; same address unwrapLPs.js already defaults to.
const POSITION_MANAGER = '0x58daec3116aae6d93017baaea7749052e8a04fa7'

// SHROOM launched via Pons, which locks each launch's genesis LP in this contract. The canonical
// SHROOM/MU liquidity is position #1526917 (full range, opened once and never modified since).
//
// This is the locked launch liquidity of category 2 above: held by Pons, not by the Shroom team, so
// it is not POL -- but it is unwithdrawable and backs the token, so it counts as protocol TVL. It is
// also the single largest line in TVL, most of the MU.
//
// The position is pinned by id rather than discovered. The locker is SHARED by every Pons launch and
// holds thousands of positions, so "locker-held positions in a SHROOM pool" is not a safe filter: a
// Pons token launched *against* SHROOM would put its own locked genesis LP in a SHROOM pool, and that
// liquidity belongs to the other token, not to Shroom.
const PONS_LAUNCH_LOCKER = '0x267444D099b10fB5Ed7c3Cc7B7c767AdcA574952'
const GENESIS_POSITION_ID = '1526917'

// Team-owned wallets, confirmed by the team -- the POL of category 1, and the only addresses whose
// loose reserves are counted. Deliberately NOT included: 0x36f4E1803f6fF34562dB567f347dea00DeC87246,
// a third party that holds 27 positions in SHROOM's pools and a ~$1M tokenized-equity book -- more
// than the protocol itself owns, so counting it would roughly triple a wrong TVL.
const PROTOCOL_WALLETS = [
  '0xAd5Bc794c2829E671a7F5c135cA85Ff97a62638b',
  '0xFca196eAcf630F67b505023C4f2cf7Eb36da2f9F',
]

// Initialize of the genesis SHROOM/MU pool; no SHROOM position can predate it.
const FROM_BLOCK = 52657452

const TRANSFER = 'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
const OWNER_OF = 'function ownerOf(uint256) view returns (address)'
const POOL_AND_POSITION_INFO = 'function getPoolAndPositionInfo(uint256 tokenId) view returns ((address token0, address token1, uint24 fee, int24 tickSpacing, address hook), uint256 info)'

const topicHash = (eventAbi) => new ethers.Interface([eventAbi]).fragments[0].topicHash
const addressTopic = (address) => ethers.zeroPadValue(address.toLowerCase(), 32)

/**
 * The team's own Uniswap V4 positions in pools that contain SHROOM.
 *
 * Discovery is owner-first: the PositionManager's Transfer logs are filtered to the team wallets,
 * which keeps the log scan to the handful of positions they have ever been sent. Each candidate is
 * then checked against the chain -- still owned by a team wallet, and in a pool with SHROOM on one
 * side. Enumerating SHROOM's ~225 pools and their positions instead would mean scanning tens of
 * thousands of PoolManager logs, which the public Robinhood RPCs will not serve reliably.
 *
 * @param {object} api defillama-sdk ChainApi, pinned to the block being valued
 * @returns {Promise<string[]>} PositionManager token ids
 */
async function getTeamPositionIds(api) {
  const transfers = await getLogs2({
    api, target: POSITION_MANAGER, eventAbi: TRANSFER, fromBlock: FROM_BLOCK, extraKey: 'positions-in',
    topics: [topicHash(TRANSFER), null, PROTOCOL_WALLETS.map(addressTopic)],
  })
  const ids = [...new Set(transfers.map((i) => i.tokenId.toString()))]
  if (!ids.length) return []

  // ownerOf resolves at api.block, so historical queries get historical ownership.
  const [owners, pools] = await Promise.all([
    api.multiCall({ abi: OWNER_OF, target: POSITION_MANAGER, calls: ids, permitFailure: true }),
    api.multiCall({ abi: POOL_AND_POSITION_INFO, target: POSITION_MANAGER, calls: ids, permitFailure: true }),
  ])
  const wallets = PROTOCOL_WALLETS.map((i) => i.toLowerCase())

  return ids.filter((_, i) => {
    if (!owners[i] || !wallets.includes(owners[i].toLowerCase())) return false
    const poolKey = pools[i]?.[0]
    if (!poolKey) return false
    return [poolKey.token0, poolKey.token1].some((token) => token.toLowerCase() === SHROOM)
  })
}

/**
 * The Pons-locked genesis SHROOM/MU position, if the locker still holds it.
 *
 * Checked rather than assumed: if the position is ever moved out of the locker it stops being locked
 * launch liquidity, and should stop counting.
 *
 * @param {object} api defillama-sdk ChainApi, pinned to the block being valued
 * @returns {Promise<string[]>} the genesis token id, or an empty array
 */
async function getLockedPositionIds(api) {
  const [owner] = await api.multiCall({
    abi: OWNER_OF, target: POSITION_MANAGER, calls: [GENESIS_POSITION_ID], permitFailure: true,
  })
  return owner && owner.toLowerCase() === PONS_LAUNCH_LOCKER.toLowerCase() ? [GENESIS_POSITION_ID] : []
}

/**
 * Both sides of everything counted, before the SHROOM/non-SHROOM split.
 *
 * @param {object} api defillama-sdk ChainApi, pinned to the block being valued
 * @returns {Promise<object>} balance map keyed `robinhood:<token>`, lowercased
 */
async function collect(api) {
  const balances = {}
  const [team, locked] = await Promise.all([getTeamPositionIds(api), getLockedPositionIds(api)])
  const positionIds = [...team, ...locked]

  if (positionIds.length)
    await sumTokens2({ api, balances, resolveUniV4: true, uniV4ExtraConfig: { positionIds } })

  // Loose reserves. Auto-discovery keeps up with the treasury rebalancing between equities, and is
  // safe here because these are the team's own wallets, unlike the shared locker.
  await sumTokens2({ api, balances, owners: PROTOCOL_WALLETS, tokens: [ADDRESSES.null], fetchBlockscoutTokens: true })

  // The V4 resolver keys tokens as they appear in the pool key (checksummed) while the balance path
  // lowercases them, so the same token can arrive under two keys. Fold them together so each token
  // is one entry and the SHROOM split below has a single key to match.
  const normalized = {}
  Object.entries(balances).forEach(([key, value]) => sdk.util.sumSingleBalance(normalized, key.toLowerCase(), value))
  return normalized
}

// tvl and ownTokens are two views of one balance map, and are called concurrently. Without this the
// position discovery -- and its log query -- would run twice per refresh, which the public Robinhood
// RPCs answer with 429s.
const collectCache = {}

/**
 * Memoised {@link collect}, keyed by chain and block.
 *
 * @param {object} api defillama-sdk ChainApi, pinned to the block being valued
 * @returns {Promise<object>} the shared balance map for that block
 */
function getBalances(api) {
  const key = `${api.chain}-${api.block}`
  if (!collectCache[key]) collectCache[key] = collect(api)
  return collectCache[key]
}

// One filter over the finished balance map, rather than a whitelist per resolver: it cannot leak
// whichever resolver a SHROOM balance arrived through.
const isSHROOM = (key) => key.toLowerCase().endsWith(SHROOM.slice(2).toLowerCase())

/**
 * Builds a tvl function returning only the balances whose token key passes `keep`.
 *
 * @param {(key: string) => boolean} keep predicate over `robinhood:<token>` keys
 * @returns {(api: object) => Promise<object>} a defillama tvl function
 */
const split = (keep) => async (api) => {
  await api.getBlock()
  const balances = { ...await getBalances(api) }
  Object.keys(balances).forEach((key) => {
    if (keep(key)) return
    delete balances[key]
  })
  return balances
}

module.exports = {
  methodology: "TVL is the liquidity permanently backing SHROOM on Uniswap V4 on Robinhood Chain, in two forms. First, protocol owned liquidity: positions the Shroom team owns and manages, pairing SHROOM against MU, tokenized equities and other assets, whose fees are recycled into deepening the pools, buybacks and burns. Second, the locked launch liquidity in the canonical SHROOM/MU pool, which Pons locked at launch -- the team does not own it, so it is not protocol owned liquidity, but nobody can withdraw it and it is committed to backing the token, so it is counted as protocol TVL. It is the largest single line in TVL. Only the non-SHROOM side of each position is counted, together with the loose reserves held in the team's own wallets. The team's positions are discovered from the PositionManager's Transfer logs and kept only while a team wallet still owns them and the pool has SHROOM on one side. The locked genesis position is pinned by id and counted only while the Pons launch locker still holds it, because that locker is shared by every Pons launch and a token launched against SHROOM would otherwise have its own locked liquidity counted here. Liquidity owned by third parties is excluded, so this measures the liquidity backing SHROOM rather than total pool depth. Own tokens count the SHROOM side of those positions plus SHROOM held in the team wallets; SHROOM has no DefiLlama price today, so that bucket reports the token amount but values at zero. Uncollected LP fees are not counted, so TVL lags slightly between fees accruing and being redeployed. Burned SHROOM is excluded, as are positions opened directly against the PoolManager without an NFT, which cannot be attributed to an owner.",
  start: '2026-09-02',
  // The same liquidity is counted by the uniswap-v4 adapter, which reads PoolManager balances here.
  doublecounted: true,
  robinhood: {
    tvl: split((key) => !isSHROOM(key)),
    ownTokens: split(isSHROOM),
  },
}
