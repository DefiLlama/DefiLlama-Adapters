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
const POOL_MANAGER = '0x8366a39CC670B4001A1121B8F6A443A643e40951'
// Uniswap V4 PositionManager on this chain; same address unwrapLPs.js already defaults to.
const POSITION_MANAGER = '0x58daec3116aae6d93017baaea7749052e8a04fa7'

// SHROOM launched via Pons, which locks each launch's genesis LP in this contract. The canonical
// SHROOM/MU liquidity is position #1526917 (full range, opened once and never modified since).
//
// This is the locked launch liquidity of category 2 above: held by Pons, not by the Shroom team, so
// it is not POL -- but it is unwithdrawable and backs the token, so it counts as protocol TVL. It is
// also the single largest line in TVL, most of the MU.
//
// The locker is SHARED by every Pons launch: it holds 5k+ position NFTs and 5k+ ERC20s belonging to
// other tokens. So it may only ever be read pool-scoped, as below -- never by enumerating what it
// owns, and never for loose token balances, either of which would import other projects' assets.
const PONS_LAUNCH_LOCKER = '0x267444D099b10fB5Ed7c3Cc7B7c767AdcA574952'

// Team-owned wallets, confirmed by the team -- the POL of category 1, and the only addresses whose
// loose reserves are counted. Deliberately NOT included: 0x36f4E1803f6fF34562dB567f347dea00DeC87246,
// a third party that holds 27 positions in SHROOM's pools and a ~$1M tokenized-equity book -- more
// than the protocol itself owns, so counting it would roughly triple a wrong TVL.
const PROTOCOL_WALLETS = [
  '0xAd5Bc794c2829E671a7F5c135cA85Ff97a62638b',
  '0xFca196eAcf630F67b505023C4f2cf7Eb36da2f9F',
]

// Whose SHROOM-pool positions count toward TVL: the team's own (POL) plus the Pons-locked launch
// liquidity, which is not POL but is permanently committed to backing the token.
const POSITION_OWNERS = [...PROTOCOL_WALLETS, PONS_LAUNCH_LOCKER].map(i => i.toLowerCase())

// Initialize of the genesis SHROOM/MU pool; nothing to scan before it.
const FROM_BLOCK = 52657452

const INITIALIZE = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)'
const MODIFY_LIQUIDITY = 'event ModifyLiquidity(bytes32 indexed id, address indexed sender, int24 tickLower, int24 tickUpper, int256 liquidityDelta, bytes32 salt)'
const TRANSFER = 'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
const OWNER_OF = 'function ownerOf(uint256) view returns (address)'

const topicHash = (eventAbi) => new ethers.Interface([eventAbi]).fragments[0].topicHash
const addressTopic = (address) => ethers.zeroPadValue(address.toLowerCase(), 32)

// Every pool SHROOM is a currency in -- 224 of them today. V4 orders currencies by address, so both
// slots have to be scanned: SHROOM is currency0 in 41 pools and currency1 in the other 183.
async function getPoolIds(api) {
  const topic0 = topicHash(INITIALIZE)
  const shroom = addressTopic(SHROOM)
  const [asCurrency0, asCurrency1] = await Promise.all([
    getLogs2({ api, target: POOL_MANAGER, eventAbi: INITIALIZE, fromBlock: FROM_BLOCK, extraKey: 'init-currency0', topics: [topic0, null, shroom] }),
    getLogs2({ api, target: POOL_MANAGER, eventAbi: INITIALIZE, fromBlock: FROM_BLOCK, extraKey: 'init-currency1', topics: [topic0, null, null, shroom] }),
  ])
  return [...new Set([...asCurrency0, ...asCurrency1].map(i => i.id))]
}

// Position ids in SHROOM's pools that count toward TVL -- the team's own plus the Pons-locked one.
//
// Discovery has to be pool-scoped rather than owner-scoped, because of the shared Pons locker above.
// One query covers every pool by passing the pool list as the indexed-topic filter. The cache key
// carries a fingerprint of that list: when a pool is added the key changes and the history is
// refetched from scratch, instead of the new pool's pre-cache logs being silently skipped.
async function getOwnedPositionIds(api) {
  const poolIds = await getPoolIds(api)
  if (!poolIds.length) return []

  const sorted = [...poolIds].sort()
  const fingerprint = ethers.id(sorted.join(',')).slice(2, 12)
  const logs = await getLogs2({
    api, target: POOL_MANAGER, eventAbi: MODIFY_LIQUIDITY, fromBlock: FROM_BLOCK,
    extraKey: `modify-liquidity-${sorted.length}-${fingerprint}`,
    topics: [topicHash(MODIFY_LIQUIDITY), sorted],
  })

  // For liquidity added through the PositionManager, salt is the position's tokenId. Positions opened
  // directly against the PoolManager by a hook or custom manager carry an unrelated salt and have no
  // NFT, so they cannot be attributed by ownerOf and are skipped (see methodology).
  const inShroomPools = new Set(logs
    .filter((i) => i.sender.toLowerCase() === POSITION_MANAGER)
    .map((i) => BigInt(i.salt).toString()))
  if (!inShroomPools.size) return []

  // Intersect with the positions our owners have ever been sent, rather than calling ownerOf on every
  // position in every SHROOM pool -- that is >10k calls per refresh, of which ~99% are other people's.
  // Both log sets are cached, so the recurring cost is one ownerOf call per candidate we actually hold.
  const transfers = await getLogs2({
    api, target: POSITION_MANAGER, eventAbi: TRANSFER, fromBlock: FROM_BLOCK, extraKey: 'transfers-in',
    topics: [topicHash(TRANSFER), null, POSITION_OWNERS.map(addressTopic)],
  })
  const ids = [...new Set(transfers.map((i) => i.tokenId.toString()))].filter((id) => inShroomPools.has(id))
  if (!ids.length) return []

  // Ownership can have moved on since the transfer in. Resolved at api.block, so historical queries
  // get historical ownership.
  const owners = await api.multiCall({ abi: OWNER_OF, target: POSITION_MANAGER, calls: ids, permitFailure: true })
  return ids.filter((_, i) => owners[i] && POSITION_OWNERS.includes(owners[i].toLowerCase()))
}

// Both sides of everything counted, before the SHROOM/non-SHROOM split.
async function collect(api) {
  const balances = {}
  const positionIds = await getOwnedPositionIds(api)

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
// position discovery -- and its log queries -- would run twice per refresh, which the public
// Robinhood RPCs answer with 429s.
const collectCache = {}
function getBalances(api) {
  const key = `${api.chain}-${api.block}`
  if (!collectCache[key]) collectCache[key] = collect(api)
  return collectCache[key]
}

// One filter over the finished balance map, rather than a whitelist per resolver: it cannot leak
// whichever resolver a SHROOM balance arrived through.
const isSHROOM = (key) => key.toLowerCase().endsWith(SHROOM.slice(2).toLowerCase())

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
  methodology: "TVL is the liquidity permanently backing SHROOM on Uniswap V4 on Robinhood Chain, in two forms. First, protocol owned liquidity: positions the Shroom team owns and manages, pairing SHROOM against MU, tokenized equities and other assets, whose fees are recycled into deepening the pools, buybacks and burns. Second, the locked launch liquidity in the canonical SHROOM/MU pool, which Pons locked at launch -- the team does not own it, so it is not protocol owned liquidity, but nobody can withdraw it and it is committed to backing the token, so it is counted as protocol TVL. It is the largest single line in TVL. Only the non-SHROOM side of each position is counted, together with the loose reserves held in the team's own wallets. Positions are found by listing every pool SHROOM is a currency in from the PoolManager's Initialize logs, then taking the positions in those pools whose NFT is held by a team wallet or by the Pons launch locker. Discovery is scoped to SHROOM's own pools because the Pons locker is shared by every Pons launch, so only its SHROOM liquidity is ever counted and none of its other holdings are. Liquidity owned by third parties is excluded, so this measures the liquidity backing SHROOM rather than total pool depth. Own tokens count the SHROOM side of those positions plus SHROOM held in the team wallets; SHROOM has no DefiLlama price today, so that bucket reports the token amount but values at zero. Uncollected LP fees are not counted, so TVL lags slightly between fees accruing and being redeployed. Burned SHROOM is excluded, as are positions opened directly against the PoolManager without an NFT, which cannot be attributed to an owner.",
  start: '2026-09-02',
  // The same liquidity is counted by the uniswap-v4 adapter, which reads PoolManager balances here.
  doublecounted: true,
  robinhood: {
    tvl: split((key) => !isSHROOM(key)),
    ownTokens: split(isSHROOM),
  },
}
