const { nullAddress } = require('../helper/tokenMapping')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

const SLVR = '0x791229E3EbD6CFdC3D8157f48722684173C29aD9'
const SLVR_WETH_LP = '0xe365b92239097Ed3322131411DbE15a5c4068eff'

// Games hot-swap (the grid lottery has been redeployed several times), so the live game list
// comes from the on-chain SlvrGameRegistry rather than a hardcoded address.
const GAME_REGISTRY = '0x3942CdA122eF303f47d4509A6Be57736E323cEE4'
const GAME_INFO_ABI = 'function gameInfo(uint256) view returns ((address game, bytes32 gameType, uint8 status, uint8 tier, uint32 emissionWeight, uint16 maxWeightBps, bool exists))'

// Core contracts holding user ETH (jackpot, pending staker rewards, auto-commit deposits, locked
// winnings, undistributed growth-fund revenue) and SLVR pending claims/emissions.
const CORE_CONTRACTS = [
  '0x24b723e2da172961f60cd6a4699654c89d4ac6cd', // SlvrJackpot
  '0xaF68598eBd245DC3cB92FF16E9Ba1814DD137200', // SlvrVoteEscrowStaking
  '0x314c8D5755468224AC60c36FB5494F0D7D5Abb3B',
  '0x1399115FcF2a9C41e5080547A9214156A4Bf8a45', // SlvrAutoCommit
  '0x2fD3BE762eb9d8eE293dD923D8809Dbd3D653dd7', // SlvrClaimLocker
  '0x1a1633fdb2f19082099a6ad6c3d4f1ec6bce9729', // SlvrGrowthFund
  '0xacdd8e9bad637798dbdb23a59cfa314743668ba4', // SlvrBuybackBurn — 2% rake buyback ETH pending its SLVR buy-and-burn
]

// All games ever registered (retired ones can still hold unclaimed user funds) + core contracts
async function gameContracts(api) {
  const count = await api.call({ abi: 'uint256:gameCount', target: GAME_REGISTRY })
  const calls = []
  for (let id = 1; id <= Number(count); id++) calls.push({ params: [id] })
  const games = await api.multiCall({ abi: GAME_INFO_ABI, target: GAME_REGISTRY, calls })
  return [...games.map(i => i.game), ...CORE_CONTRACTS]
}
const VOTE_ESCROW = '0xd9b8FBD61033145c5496132153CE675756313B71'
const VOTE_ESCROW_DEPLOY_BLOCK = 5574784
const LIQUIDITY_STAKING = '0x7D888f4Ca88Fc3578aEfc45C82482Bd66415DfeA'

// liSLVR liquid locker: SLVR in, non-rebasing liSLVR shares out. Deposited SLVR is permanently
// locked into the vault's vote-escrow NFT, so the vault's position is counted by the veNFT lock
// enumeration below; only its ETH income and not-yet-locked SLVR balance are counted separately.
const LISLVR_VAULT = '0xb06a7A96d7fbfDCC64AeE0F0B185204b66E41b3B'
// Staked liSLVR earns the vault's ETH income stream.
const LISLVR_STAKING = '0x7B553a3cCe0f0FFA967EE5A4E31aAff45DbF3855'
// Pooled ETH mining: users deposit ETH the pool wagers on the grid lottery.
const LISLVR_MINING_POOL = '0xa99dE7E00bd1A493Be70431956eBA9838CD1A861'

const LOCK_CREATED_ABI = 'event LockCreated(uint256 indexed tokenId, address indexed user, uint256 amount, uint256 duration, bool permanent)'
const LOCKS_ABI = 'function locks(uint256) view returns (uint256 amount, uint256 lockStart, uint256 lockEnd, bool permanent, bool isMaxTime)'

async function tvl(api) {
  return api.sumTokens({
    owners: [...await gameContracts(api), LISLVR_VAULT, LISLVR_STAKING, LISLVR_MINING_POOL],
    tokens: [nullAddress],
  })
}

async function staking(api) {
  // Permanent (4x) locks BURN the deposited SLVR, so locked SLVR cannot be counted by scanning
  // token balances — only withdrawable locks leave a balance on the vote escrow. Instead,
  // enumerate every lock NFT ever minted and sum the lock amounts on-chain (withdrawn locks read
  // as zero). This covers withdrawable locks, direct permanent locks and the liSLVR vault's
  // permanent lock in one pass, each exactly once.
  const created = await getLogs2({ api, target: VOTE_ESCROW, eventAbi: LOCK_CREATED_ABI, fromBlock: VOTE_ESCROW_DEPLOY_BLOCK })
  let maxId = 0
  created.forEach(i => { if (Number(i.tokenId) > maxId) maxId = Number(i.tokenId) })
  const readLocks = async (ids) => api.multiCall({ abi: LOCKS_ABI, target: VOTE_ESCROW, calls: ids.map(id => ({ params: [id] })) })
  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
  const locks = await readLocks(range(1, maxId))
  // convertToPermanentLock mints fresh permanent-lock NFTs without a LockCreated event, so probe
  // past the last logged id. Token ids are minted sequentially and a conversion-minted lock is
  // permanent (can never be withdrawn to zero), so an entirely empty chunk proves the end.
  const CHUNK = 100
  while (true) {
    const chunk = await readLocks(range(maxId + 1, maxId + CHUNK))
    locks.push(...chunk)
    if (chunk.every(lock => lock.amount === '0' || lock.amount === 0 || Number(lock.amount) === 0)) break
    maxId += CHUNK
  }
  locks.forEach(lock => api.add(SLVR, lock.amount))
  // SLVR held for users outside locks: game contract balances (pending claims/emissions) and the
  // liSLVR vault's deposits pending lock. The vote escrow's own balance is NOT scanned — it equals
  // the withdrawable locks already counted above.
  return api.sumTokens({ owners: [...await gameContracts(api), LISLVR_VAULT], tokens: [SLVR] })
}

async function pool2(api) {
  // api.sumTokens (SDK) ignores resolveLP — the unwrapLPs helper is what resolves the LP
  return sumTokens2({ api, owners: [LIQUIDITY_STAKING], tokens: [SLVR_WETH_LP], resolveLP: true })
}

module.exports = {
  methodology:
    'TVL sums the native ETH held on behalf of users by the SLVR game contracts (live round pots and carry pools plus unclaimed winner emissions, the accumulating jackpot, pending veNFT staker rewards, auto-commit deposits, locked winnings and undistributed growth-fund revenue) and by the liSLVR liquid-locker contracts (undistributed vault income, liSLVR staking rewards and pooled mining deposits). Staking counts all SLVR locked into vote-escrow NFTs — withdrawable locks, permanent locks (whose SLVR is burned on lock and therefore invisible to balance scans) and the liSLVR vault position — by enumerating every lock on-chain, plus SLVR held by game contracts and liSLVR vault deposits pending lock. liSLVR itself is a share token on already-counted SLVR and is never counted. Pool2 counts SLVR/WETH LP staked in SlvrLiquidityStaking.',
  robinhood: { tvl, staking, pool2 },
}
