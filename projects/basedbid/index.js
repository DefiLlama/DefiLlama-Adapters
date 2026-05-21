const ethers = require('ethers')
const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

// based.bid contract addresses on each supported chain
const BASED_BID = {
  ethereum: '0x3cb3D9E659653de02D8e3Aecd4963Ba1Ae429682',
  bsc:      '0x920b4Ee4970CFE1ef523a0679200f9d9b2F87B2c',
  base:     '0x0F2C33F406D58144Dec03FCdb69571249F0b0286',
  megaeth:  '0x695e175c9704432cdFB98e3C193966F95a5F119D',
}

// World Liberty Financial USD1 — same address on Ethereum and BSC; not officially
// deployed on Base or MegaETH so it is omitted there.
const USD1_ETH_BSC = '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d'

// Native + USDT/USDC/USD1 + wrapped native held directly by the based.bid address.
const TRACKED_TOKENS = {
  ethereum: [
    ADDRESSES.null,
    ADDRESSES.ethereum.WETH,
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.USDC,
    USD1_ETH_BSC,
  ],
  bsc: [
    ADDRESSES.null,
    ADDRESSES.bsc.WBNB,
    ADDRESSES.bsc.USDT,
    ADDRESSES.bsc.USDC,
    ADDRESSES.bsc.USD1,
  ],
  base: [
    ADDRESSES.null,
    ADDRESSES.base.WETH,
    ADDRESSES.base.USDT,
    ADDRESSES.base.USDC,
  ],
  megaeth: [
    ADDRESSES.null,
    ADDRESSES.megaeth.ETH,
    ADDRESSES.megaeth.USDT,
  ],
}

// Wrapped-native lookup. PancakeSwap Infinity uses address(0) as the
// poolKey currency for the chain's native coin; we route those through the
// wrapped-native token so the pricer can resolve a USD value.
const WRAPPED_NATIVE = {
  ethereum: ADDRESSES.ethereum.WETH,
  bsc:      ADDRESSES.bsc.WBNB,
  base:     ADDRESSES.base.WETH,
  megaeth:  ADDRESSES.megaeth.ETH,
}

// Uniswap V3-style NFT position managers (Uniswap V3 + PancakeSwap V3).
// These plug straight into the SDK's `unwrapUniswapV3NFTs` helper because
// the position NFTs are ERC721Enumerable.
const PANCAKE_V3_NFT = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364'

const UNIV3_LIKE_NFTS = {
  ethereum: [
    '0xC36442b4a4522E871399CD717aBDD847Ab11FE88', // Uniswap V3
    PANCAKE_V3_NFT,
  ],
  bsc: [
    '0x7b8a01b39d58278b5de7e48c8449c9f4f5170613', // Uniswap V3
    PANCAKE_V3_NFT,
  ],
  base: [
    '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1', // Uniswap V3
    PANCAKE_V3_NFT,
  ],
  megaeth: [
    '0xcb91c75a6b29700756d4411495be696c4e9a576e', // Uniswap V3 (MegaETH)
  ],
}

// PancakeSwap Infinity Concentrated Liquidity (BSC + Base).
// https://developer.pancakeswap.finance/contracts/infinity/resources/addresses
//
// The SDK does not yet ship an unwrap helper for PCS-Infinity NFTs (unlike
// Uniswap V3 / V4 which have `unwrapUniswapV3NFTs` / `unwrapUniswapV4NFTs`).
// PCS-Infinity differs from Uniswap V4 in two important ways:
//   1. `positions(tokenId)` returns a `(currency0, currency1, hooks,
//      poolManager, fee, parameters)` poolKey instead of V4's
//      `(currency0, currency1, fee, tickSpacing, hooks)`.
//   2. The current tick is read from the PoolManager's `getSlot0(poolId)`
//      instead of a separate StateView contract.
// And the position NFT is **not** ERC721Enumerable, so we cannot enumerate
// owned tokenIds with `tokenOfOwnerByIndex` like we do for Uniswap V3.
//
// `unwrapPancakeInfinityCL` below is intentionally modelled after the SDK's
// `unwrapUniswapV4NFT` (helper/unwrapLPs.js): discover positionIds → fetch
// `positions(id)` → derive `poolId` from the poolKey → read `tick` →
// reuse the SDK's `addUniV3LikePosition` for the standard CL math.
const PCS_INFINITY = {
  bsc: {
    posm:        '0x55f4c8aba71a1e923edc303eb4feff14608cc226',
    poolManager: '0xa0FfB9c1CE1Fe56963B0321B32E7A0302114058b',
    fromBlock:   47214308,
  },
  base: {
    posm:        '0x55f4c8aba71a1e923edc303eb4feff14608cc226',
    poolManager: '0xa0FfB9c1CE1Fe56963B0321B32E7A0302114058b',
    fromBlock:   30544106,
  },
}

const PCS_INFINITY_POSITIONS_ABI =
  'function positions(uint256) view returns ((address currency0, address currency1, address hooks, address poolManager, uint24 fee, bytes32 parameters) poolKey, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, address subscriber)'
const SLOT0_ABI =
  'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'
const OWNER_OF_ABI = 'function ownerOf(uint256) view returns (address)'
const TRANSFER_EVENT_ABI =
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'

async function unwrapPancakeInfinityCL(api, owner) {
  const cfg = PCS_INFINITY[api.chain]
  if (!cfg) return

  const positionIds = await getInfinityPositionIds(api, cfg, owner)
  if (!positionIds.length) return

  const positions = await api.multiCall({
    abi: PCS_INFINITY_POSITIONS_ABI,
    target: cfg.posm,
    calls: positionIds,
    permitFailure: true,
  })

  // Map each position to its poolId (= keccak256(abi.encode(poolKey))).
  const coder = new ethers.AbiCoder()
  const poolIds = positions.map(p => {
    if (!p) return null
    const k = p.poolKey
    return ethers.keccak256(coder.encode(
      ['address', 'address', 'address', 'address', 'uint24', 'bytes32'],
      [k.currency0, k.currency1, k.hooks, k.poolManager, k.fee, k.parameters],
    ))
  })

  const validIdx = poolIds.map((id, i) => id ? i : -1).filter(i => i >= 0)
  if (!validIdx.length) return

  const slot0 = await api.multiCall({
    abi: SLOT0_ABI,
    target: cfg.poolManager,
    calls: validIdx.map(i => poolIds[i]),
    permitFailure: true,
  })

  const wrappedNative = WRAPPED_NATIVE[api.chain]

  validIdx.forEach((i, j) => {
    const pos = positions[i]
    const slot = slot0[j]
    if (!pos || !slot || !pos.liquidity || pos.liquidity == 0) return

    addUniV3LikePosition({
      api,
      token0: pos.poolKey.currency0 === ADDRESSES.null ? wrappedNative : pos.poolKey.currency0,
      token1: pos.poolKey.currency1 === ADDRESSES.null ? wrappedNative : pos.poolKey.currency1,
      liquidity: pos.liquidity,
      tickLower: Number(pos.tickLower),
      tickUpper: Number(pos.tickUpper),
      tick: Number(slot.tick),
    })
  })
}

// When the DefiLlama indexer is unavailable (e.g. local testing), bound the
// log scan to a recent window so chunked `eth_getLogs` finishes in a
// reasonable time. ~6M BSC blocks is roughly 50 days, which comfortably
// covers based.bid's NFT holdings on every chain.
const PCS_INFINITY_RPC_LOOKBACK = 6_000_000

// Discover all PCS-Infinity NFT tokenIds currently held by `owner` by scanning
// `Transfer(_, owner, _)` events on the position manager. This mirrors the
// fallback strategy the SDK's `unwrapUniswapV4NFTs` would use if it lost
// access to the Uniswap subgraph. `getLogs2` automatically routes through the
// DefiLlama indexer in production (LLAMA_INDEXER_V2_*) and otherwise falls
// back to chunked `eth_getLogs` against the configured RPC.
async function getInfinityPositionIds(api, cfg, owner) {
  const indexerEnabled = sdk.indexer.isIndexerEnabled(api.chain)
  let fromBlock = cfg.fromBlock
  if (!indexerEnabled) {
    const head = await api.getBlock()
    fromBlock = Math.max(cfg.fromBlock, head - PCS_INFINITY_RPC_LOOKBACK)
  }

  let logs
  try {
    logs = await getLogs2({
      api,
      target: cfg.posm,
      fromBlock,
      eventAbi: TRANSFER_EVENT_ABI,
      topics: [
        ethers.id('Transfer(address,address,uint256)'),
        null,
        ethers.zeroPadValue(owner.toLowerCase(), 32),
      ],
      useIndexer: indexerEnabled,
      extraKey: `basedbid-pcs-infinity-${owner.toLowerCase()}-${indexerEnabled ? 'idx' : 'rpc'}`,
    })
  } catch (e) {
    // Log source unavailable. Keep the rest of the TVL working; PCS-Infinity
    // contributions show up once logs are reachable again.
    return []
  }

  const candidates = [...new Set(logs.map(l => String(l.tokenId)))]
  if (!candidates.length) return []

  // The NFT may have been transferred out after we observed the inbound
  // transfer, so confirm the current owner before pricing.
  const currentOwners = await api.multiCall({
    abi: OWNER_OF_ABI,
    target: cfg.posm,
    calls: candidates,
    permitFailure: true,
  })
  return candidates.filter((_, i) =>
    currentOwners[i] && currentOwners[i].toLowerCase() === owner.toLowerCase()
  )
}

async function tvl(api) {
  const chain = api.chain
  const owner = BASED_BID[chain]

  // 1. Native coin + USDT/USDC/USD1/wrapped-native held directly by based.bid.
  await sumTokens2({ api, owner, tokens: TRACKED_TOKENS[chain] || [] })

  // 2. Uniswap V3 + PancakeSwap V3 LP NFTs owned by based.bid.
  //    `uniV3ExtraConfig.nftAddress` lets `sumTokens2` route through the
  //    SDK's `unwrapUniswapV3NFTs` helper which uses balanceOf / tokenOfOwnerByIndex.
  for (const nftAddress of UNIV3_LIKE_NFTS[chain] || []) {
    await sumTokens2({ api, owner, uniV3ExtraConfig: { nftAddress } })
  }

  // 3. Uniswap V4 LP NFTs owned by based.bid.
  //    `resolveUniV4: true` triggers the SDK's `unwrapUniswapV4NFTs` helper
  //    which discovers positionIds via Uniswap's official subgraph.
  //    MegaETH has no V4 deployment, so skip there.
  if (chain !== 'megaeth')
    await sumTokens2({ api, owner, resolveUniV4: true })

  // 4. PancakeSwap Infinity CL LP NFTs (BSC + Base).
  //    No SDK helper exists for this DEX yet, so we use a custom unwrap
  //    function modelled after the SDK's `unwrapUniswapV4NFT`.
  if (PCS_INFINITY[chain])
    await unwrapPancakeInfinityCL(api, owner)
}

module.exports = {
  methodology:
    'TVL is the sum of (1) native coin and USDT/USDC/USD1/wrapped-native balances held by the based.bid contract, plus (2) liquidity locked in Uniswap V3, Uniswap V4, PancakeSwap V3 and PancakeSwap Infinity CL positions whose NFTs are owned by the based.bid contract.',
  ethereum: { tvl },
  bsc:      { tvl },
  base:     { tvl },
  megaeth:  { tvl },
}
