const { sumTokens2, unwrapSlipstreamNFT } = require('../../helper/unwrapLPs')
const ADDRESSES = require('../../helper/coreAssets.json')
const { addV4Positions, liveAt } = require('../helpers')

const V3_BOX_LOCKER = '0xFc96CF67eCC55bE4AdABc3AecBe6Ad6349f11223'
const UNI_V3_NFPM = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'
const UP_CL_BOX_LOCKER = '0xc1AfA59e2aBC1C868C51a1F799a7578EaCfEa076'
const UP_SLIPSTREAM_NFPM = '0x07F44c47743A2f36414A82b9F558ECFCf0EEdCEf'
const V4_BOX_LOCKER = '0x5a28ce098750f73bc9eC142D4bCE464E1A0BBdA6'
const UP_V2_BOX_LOCKER = '0x21797736C25851A6102D196afbA78F978f589017'
const FOREVER_ESCROW = '0x1338c12dAb6D80313819612784cC3C5bfaaD7f4d'
const FOREVER_POSM_ID = 175704
const LOCK_NFT_NEXT_ID_SLOT = 8

const V4_BOX_BLOCK = 19331425
const FOREVER_ESCROW_BLOCK = 19498880
const UP_V2_BOX_BLOCK = 32711195

const ROBINHOOD_CBBTC = '0xCEC185eB182c47d1bA1EFc84e6959e18cd620Be4'
const UP_TOKEN = '0x57C0E45cB534413D1C20A4240955d6bB250BB4F1'
const QUOTE_TOKENS = [ADDRESSES.null, ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG, ROBINHOOD_CBBTC, UP_TOKEN]

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
  locks.forEach((lock) => {
    if (!lock || lock.closed) return
    const liquidity = BigInt(lock.initialLiquidity) - BigInt(lock.withdrawnLiquidity)
    // Spam locks planted 1e27-1e30 liquidity on fake pools; real locks are far below 1e24.
    if (liquidity <= 0n || liquidity > 10n ** 24n) return
    positions.push({ key: lock, tickLower: lock.tickLower, tickUpper: lock.tickUpper, liquidity: Number(liquidity) })
  })
  await addV4Positions(api, positions)
}

async function upV2BoxTvl(api) {
  if (!liveAt(api, UP_V2_BOX_BLOCK)) return
  const lastId = await lastMintedLockId(api, UP_V2_BOX_LOCKER)
  const locks = await api.multiCall({ abi: abi.upV2Lock, target: UP_V2_BOX_LOCKER, calls: Array.from({ length: lastId }, (_, i) => i + 1), permitFailure: true })
  locks.forEach((lock) => {
    if (!lock || lock.closed) return
    const remaining = BigInt(lock.initialAmount) - BigInt(lock.withdrawnAmount)
    if (remaining > 0n) api.add(lock.pool, remaining.toString())
  })
  await sumTokens2({ api, resolveLP: true })
}

async function tvl(api) {
  await sumTokens2({ api, owner: V3_BOX_LOCKER, resolveUniV3: true, uniV3ExtraConfig: { nftAddress: UNI_V3_NFPM } })
  // Called directly: the slipstream resolver has no Robinhood default NFPM.
  await unwrapSlipstreamNFT({ api, owner: UP_CL_BOX_LOCKER, nftAddress: UP_SLIPSTREAM_NFPM })
  if (liveAt(api, FOREVER_ESCROW_BLOCK))
    await sumTokens2({ api, owner: FOREVER_ESCROW, resolveUniV4: true, uniV4ExtraConfig: { positionIds: [FOREVER_POSM_ID] } })
  await v4BoxTvl(api)
  await upV2BoxTvl(api)
}

function keepQuoteTokens(api) {
  const quotes = new Set(QUOTE_TOKENS.map((token) => `${api.chain}:${token}`.toLowerCase()))
  api.deleteTokens(Object.keys(api.getBalances()).filter((token) => !quotes.has(token.toLowerCase())))
}

module.exports = { keepQuoteTokens, tvl }
