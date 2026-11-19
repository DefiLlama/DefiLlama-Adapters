const { sumTokens2, unwrapSlipstreamNFT } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const { addV4Positions, keepOnlyTokens, liveAt } = require('./helpers')

// Safety Deposit Box lockers: Uniswap V3 box + up. DEX (Slipstream) box (which
// also holds every Safe Launch graduation pool, locked forever at bond) +
// Uniswap v4 box (raw PoolManager positions, no NFT) + up. V2 LP box.
const V3_BOX_LOCKER = '0xFc96CF67eCC55bE4AdABc3AecBe6Ad6349f11223'
const UNI_V3_NFPM = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
const UP_CL_BOX_LOCKER = '0xc1AfA59e2aBC1C868C51a1F799a7578EaCfEa076'
const UP_SLIPSTREAM_NFPM = '0x07F44c47743A2f36414A82b9F558ECFCf0EEdCEf'
const V4_BOX_LOCKER = '0x5a28ce098750f73bc9eC142D4bCE464E1A0BBdA6'
const UP_V2_BOX_LOCKER = '0x21797736C25851A6102D196afbA78F978f589017'
// StonkLockerOwnershipNFT: slot 8 is _nextTokenId (no public getter).
const LOCK_NFT_NEXT_ID_SLOT = 8

const V4_BOX_BLOCK = 19331425
const UP_V2_BOX_BLOCK = 32711195

const STONK_ESCROW = '0x799AE26fA515ceF145e8bC8636F7fFF87B05Cf62'
const STONKBROKER = '0xe934e36A439C94017B64a3FecE66AF12099aBF50'
const ROBINHOOD_CBBTC = '0xCEC185eB182c47d1bA1EFc84e6959e18cd620Be4'
const UP_TOKEN = '0x57C0E45cB534413D1C20A4240955d6bB250BB4F1' // up. DEX token, most of its liquidity sits outside the lockers
// Only tokens with a broad market outside the lockers count: the other legs
// are launched tokens whose only price source is the locked pool itself.
const TVL_TOKENS = [
  ADDRESSES.null, ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG, ROBINHOOD_CBBTC, UP_TOKEN,
  '0x39dbed3a2bd333467115de45665cc57f813c4571', // PONS
  '0x020bfc650a365f8bb26819deaabf3e21291018b4', // CASHCAT
  // Robinhood stock tokens
  '0xaf3d76f1834a1d425780943c99ea8a608f8a93f9', // AAPL
  '0x1b0e319c6a659f002271b69db8a7df2f911c153e', // GME
  '0x4a0e65a3eccec6dbe60ae065f2e7bb85fae35eea', // SPCX
  '0x2e0847e8910a9732eb3fb1bb4b70a580adad4fe3', // GOOGL
  '0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec', // NVDA
  '0xa30fa36db767ad9ed3f7a60fc79526fb4d56d344', // USO
]

const abi = {
  v4Lock: 'function lockPositions(uint256) view returns (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks, int24 tickLower, int24 tickUpper, uint128 initialLiquidity, uint128 withdrawnLiquidity, uint64 startUnlock, uint64 finishUnlock, uint8 feeMode, bool closed)',
  upV2Lock: 'function lockPositions(uint256) view returns (address pool, address vault, address token0, address token1, uint256 lockTokenId, uint256 initialAmount, uint256 withdrawnAmount, uint64 startUnlock, uint64 finishUnlock, uint8 feeMode, bool closed, address gauge)',
}

async function lastMintedLockId(api, locker) {
  const nft = await api.call({ abi: 'address:lockNft', target: locker })
  const next = await api.provider.getStorage(nft, LOCK_NFT_NEXT_ID_SLOT, api.block ?? 'latest')
  return Number(BigInt(next)) - 1
}

async function v4BoxTvl(api) {
  if (!liveAt(api, V4_BOX_BLOCK)) return
  const lastId = await lastMintedLockId(api, V4_BOX_LOCKER)
  const locks = await api.multiCall({ abi: abi.v4Lock, target: V4_BOX_LOCKER, calls: Array.from({ length: lastId }, (_, i) => i + 1), permitFailure: true })
  const positions = []
  locks.forEach((l) => {
    if (!l || l.closed) return
    const liquidity = BigInt(l.initialLiquidity) - BigInt(l.withdrawnLiquidity)
    // Spam locks planted 1e27-1e30 liquidity on fake pools; real locks are far below 1e24.
    if (liquidity <= 0n || liquidity > 10n ** 24n) return
    positions.push({ key: l, tickLower: l.tickLower, tickUpper: l.tickUpper, liquidity: Number(liquidity) })
  })
  await addV4Positions(api, positions)
}

async function upV2BoxTvl(api) {
  if (!liveAt(api, UP_V2_BOX_BLOCK)) return
  const lastId = await lastMintedLockId(api, UP_V2_BOX_LOCKER)
  const locks = await api.multiCall({ abi: abi.upV2Lock, target: UP_V2_BOX_LOCKER, calls: Array.from({ length: lastId }, (_, i) => i + 1), permitFailure: true })
  locks.forEach((l) => {
    if (!l || l.closed) return
    const remaining = BigInt(l.initialAmount) - BigInt(l.withdrawnAmount)
    if (remaining > 0n) api.add(l.pool, remaining.toString())
  })
  await sumTokens2({ api, resolveLP: true })
}

async function lockerBalances(api) {
  await sumTokens2({ api, owner: V3_BOX_LOCKER, resolveUniV3: true, uniV3ExtraConfig: { nftAddress: UNI_V3_NFPM } })
  // Called directly: the slipstream resolver has no Robinhood default NFPM.
  await unwrapSlipstreamNFT({ api, owner: UP_CL_BOX_LOCKER, nftAddress: UP_SLIPSTREAM_NFPM })
  await v4BoxTvl(api)
  await upV2BoxTvl(api)
}

async function tvl(api) {
  await lockerBalances(api)
  // Keep only the listed tokens; this also drops STONKBROKER, tracked under staking.
  keepOnlyTokens(api, TVL_TOKENS)
}

// STONKBROKER in the escrow contract plus the STONKBROKER leg of locked positions.
async function staking(api) {
  await lockerBalances(api)
  await sumTokens2({ api, owner: STONK_ESCROW, tokens: [STONKBROKER] })
  keepOnlyTokens(api, [STONKBROKER])
}

module.exports = {
  methodology:
    'TVL is the liquidity locked in the Safety Deposit Box lockers on Robinhood Chain: Uniswap V3 position NFTs in the V3 box, up. DEX (Slipstream) positions in the up. CL box (including every Stonklauncher / Safe Launch graduation pool, whose raise + LP tax reserve is locked forever at bond), Uniswap v4 PoolManager positions in the V4 box, and up. V2 LP in the up. V2 box. Only tokens with a broad market outside the lockers are counted (ETH, WETH, USDG, cbBTC, UP, PONS, CASHCAT and Robinhood stock tokens); other launched-token legs stay unpriced and STONKBROKER is excluded from TVL. Staking tracks STONKBROKER tokens in the escrow contract plus the STONKBROKER leg of the locked positions.',
  doublecounted: true,
  robinhood: {
    tvl,
    staking,
  },
}
