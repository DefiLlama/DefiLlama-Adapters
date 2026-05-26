const ethers = require('ethers')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs')

// based.bid contract addresses on each supported chain
const BASED_BID = {
  ethereum: '0x3cb3D9E659653de02D8e3Aecd4963Ba1Ae429682',
  bsc:      '0x920b4Ee4970CFE1ef523a0679200f9d9b2F87B2c',
  base:     '0x0F2C33F406D58144Dec03FCdb69571249F0b0286',
  megaeth:  '0x695e175c9704432cdFB98e3C193966F95a5F119D',
}

const USD1_ETH_BSC = '0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d'

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

const WRAPPED_NATIVE = {
  ethereum: ADDRESSES.ethereum.WETH,
  bsc:      ADDRESSES.bsc.WBNB,
  base:     ADDRESSES.base.WETH,
  megaeth:  ADDRESSES.megaeth.ETH,
}

const PANCAKE_V3_NFT = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364'

const UNIV3_LIKE_NFTS = {
  ethereum: [
    '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    PANCAKE_V3_NFT,
  ],
  bsc: [
    '0x7b8a01b39d58278b5de7e48c8449c9f4f5170613',
    PANCAKE_V3_NFT,
  ],
  base: [
    '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
    PANCAKE_V3_NFT,
  ],
  megaeth: [
    '0xcb91c75a6b29700756d4411495be696c4e9a576e',
  ],
}

// Uniswap V4 position managers (NFT = position manager; poolId = tokenId)
const UNIV4_POSM = {
  ethereum: '0xbD216513d74C8cf14cf4747E6AaA6420FF64ee9e',
  bsc:      '0x7A4a5c919aE2541AeD11041A1AEeE68f1287f95b',
  base:     '0x7C5f5A4bBd8fD63184577525326123B519429bDc',
}

// PancakeSwap Infinity CL position managers (BSC + Base)
const PCS_INFINITY_POSM = '0x55f4c8aba71a1e923edc303eb4feff14608cc226'

const PCS_INFINITY = {
  bsc: {
    posm:        PCS_INFINITY_POSM,
    poolManager: '0xa0FfB9c1CE1Fe56963B0321B32E7A0302114058b',
  },
  base: {
    posm:        PCS_INFINITY_POSM,
    poolManager: '0xa0FfB9c1CE1Fe56963B0321B32E7A0302114058b',
  },
}

const GET_MEME_TOKEN_LIST_ABI = 'function getMemeTokenList() view returns (address[])'
const GET_MEME_TOKEN_DATA_ABI =
  'function getMemeTokenData(address memeToken) view returns (tuple(address memeOwner, uint256 volumn, uint256 virtualReserveETH, uint256 virtualReserveToken, uint256 initialVirtualReserveETH, uint256 initialVirtualReserveToken, uint256 virtualReserveETHHardcap, uint256 virtualReserveETHSoftcap, bytes32 subBoard, bytes32 keyForXSale, uint8 package, bool isXSale, bool isListed, bool isCancelled, bool isTaxToken, uint8 _padding, tuple(address baseTokenForPair, uint256 liquidityForHardcap, uint256 liquidityForSoftcap, uint256 marketCap, uint256 maxAllocationPerUser, uint256 maxAllocationPerWhitelistedUser, bytes32 whitelistMerkleRoot, uint24 buyReferralFeePer, uint24 sellMemeTokenOwnerFeePer, uint24 buyMemeTokenOwnerFeePer, uint24 finalizeFeePer, uint24 delayTradeTime, uint40 startTime, uint40 endTime, bool isWhitelist, uint48 _padding, tuple(address routerOrPositionManager, uint256 poolId, uint24 fee, int24 tickSpacing, uint24 per, bool isLPBurn, uint8 _padding)[] dex, string metaData) initialData, tuple(uint24 buyFee, uint24 sellFee) fee, uint256 tokenVersion))'
const GET_FLASH_TOKEN_COUNT_ABI = 'function getTokenCountForFlashLaunchV4() view returns (uint256)'
const GET_FLASH_TOKEN_ABI = 'function getTokenForFlashLaunchV4(uint256 index) view returns (address token)'
const GET_FLASH_POOL_DATA_ABI =
  'function getFlashLaunchV4PoolData(address tokenAddress) view returns (tuple(address owner, bool isTokenBurn, uint8 _padding1, address baseToken, uint8 _padding2, bytes32 subBoard, string metaData, address positionManager, uint8 _padding3, uint256 poolId, address hooks, tuple(bool hasV4Hook, tuple(uint16 liquidityFeeBps, uint16 buybackFeeBps, uint16 rewardFeeBps, address[] customWallets, uint16[] customWalletBps) hookFeeDistributionConfig, uint256 feeThreshold, address rewardToken, tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) rewardPoolKey, uint8 feeKind, uint24 staticPoolFeeBpsBuy, uint24 staticPoolFeeBpsSell, uint24 hookFeeBpsBuy, uint24 hookFeeBpsSell, tuple(uint24 minBaseFeeBpsBuy, uint24 minBaseFeeBpsSell, uint24 maxBaseFeeBpsBuy, uint24 maxBaseFeeBpsSell, uint32 baseFeeFactorBuy, uint32 baseFeeFactorSell, uint24 defaultBaseFeeBpsBuy, uint24 defaultBaseFeeBpsSell, uint32 surgeDecayPeriodSeconds, uint32 surgeMultiplierPpm, bool perSwapMode, uint32 capAutoTuneStepPpm, uint32 capAutoTuneIntervalSeconds) dynamicFeeConfig, tuple(uint16[] buyFeesBps, uint16[] sellFeesBps, uint256[] buyFeeTierAmountLevels, uint256[] sellFeeTierAmountLevels) tieredFeeConfig, uint48 protectPeriod, uint256 maxBuyPerOrigin, bool isAntiSandwich, uint32 cooldownSeconds, uint24 penaltyFeeBps, tuple(uint32 volumeIntervalSeconds, uint256[] volumeLevels, uint16[] volumeMultiplierBps) volumeConfig) v4HookData))'

const PCS_INFINITY_POSITIONS_ABI =
  'function positions(uint256) view returns ((address currency0, address currency1, address hooks, address poolManager, uint24 fee, bytes32 parameters) poolKey, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, address subscriber)'
const SLOT0_ABI =
  'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'

function lc(addr) {
  return addr?.toLowerCase()
}

function isUniV4Posm(chain, positionManager) {
  const expected = UNIV4_POSM[chain]
  return expected && lc(positionManager) === lc(expected)
}

function isPcsInfinityPosm(chain, positionManager) {
  if (!PCS_INFINITY[chain]) return false
  return lc(positionManager) === lc(PCS_INFINITY_POSM)
}

function poolIdIsActive(poolId) {
  try {
    return BigInt(poolId) > 0n
  } catch {
    return Number(poolId) > 0
  }
}

function registerPosition({ uniV4ByNft, pcsInfinityIds }, chain, positionManager, poolId) {
  if (!positionManager || !poolIdIsActive(poolId)) return
  const id = String(poolId)

  if (isUniV4Posm(chain, positionManager)) {
    const key = lc(positionManager)
    if (!uniV4ByNft[key]) uniV4ByNft[key] = new Set()
    uniV4ByNft[key].add(id)
    return
  }
  if (isPcsInfinityPosm(chain, positionManager)) {
    pcsInfinityIds.add(id)
  }
}

async function collectV4PositionsFromContract(api) {
  const chain = api.chain
  const basedBid = BASED_BID[chain]
  const uniV4ByNft = {}
  const pcsInfinityIds = new Set()
  const ctx = { uniV4ByNft, pcsInfinityIds }

  const memeTokens = await api.call({
    target: basedBid,
    abi: GET_MEME_TOKEN_LIST_ABI,
  }) || []

  if (memeTokens.length) {
    const memeDataList = await api.multiCall({
      target: basedBid,
      abi: GET_MEME_TOKEN_DATA_ABI,
      calls: memeTokens,
      permitFailure: true,
    })
    memeDataList.forEach((data) => {
      if (!data) return
      const dexes = data.initialData?.dex ?? []
      dexes.forEach((dex) => {
        registerPosition(ctx, chain, dex.routerOrPositionManager, dex.poolId)
      })
    })
  }

  const flashCount = Number(await api.call({
    target: basedBid,
    abi: GET_FLASH_TOKEN_COUNT_ABI,
  }) || 0)

  if (flashCount > 0) {
    const flashTokens = await api.multiCall({
      target: basedBid,
      abi: GET_FLASH_TOKEN_ABI,
      calls: Array.from({ length: flashCount }, (_, i) => ({ params: [i] })),
      permitFailure: true,
    })
    const poolDataList = await api.multiCall({
      target: basedBid,
      abi: GET_FLASH_POOL_DATA_ABI,
      calls: flashTokens.filter(Boolean),
      permitFailure: true,
    })
    poolDataList.forEach((poolData) => {
      if (!poolData) return
      registerPosition(ctx, chain, poolData.positionManager, poolData.poolId)
    })
  }

  return {
    uniV4ByNft: Object.fromEntries(
      Object.entries(uniV4ByNft).map(([k, v]) => [k, [...v]]),
    ),
    pcsInfinityIds: [...pcsInfinityIds],
  }
}

async function unwrapUniV4Positions(api, uniV4ByNft) {
  for (const [nftAddress, positionIds] of Object.entries(uniV4ByNft)) {
    if (!positionIds.length) continue
    await sumTokens2({
      api,
      uniV4ExtraConfig: {
        nftAddress,
        positionIds,
      },
    })
  }
}

async function unwrapPancakeInfinityCL(api, positionIds) {
  const cfg = PCS_INFINITY[api.chain]
  if (!cfg || !positionIds.length) return

  const positions = await api.multiCall({
    abi: PCS_INFINITY_POSITIONS_ABI,
    target: cfg.posm,
    calls: positionIds,
    permitFailure: true,
  })

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

async function tvl(api) {
  const chain = api.chain
  const owner = BASED_BID[chain]

  // 1. Native coin + stablecoins held directly by based.bid.
  await sumTokens2({ api, owner, tokens: TRACKED_TOKENS[chain] || [] })

  // 2. Uniswap V3 + PancakeSwap V3 LP NFTs (ERC721Enumerable on the NFT manager).
  for (const nftAddress of UNIV3_LIKE_NFTS[chain] || []) {
    await sumTokens2({ api, owner, uniV3ExtraConfig: { nftAddress } })
  }

  // 3. Uniswap V4 + PancakeSwap Infinity CL — position managers and tokenIds
  //    come from the based.bid registry (meme + flash launch pools).
  const { uniV4ByNft, pcsInfinityIds } = await collectV4PositionsFromContract(api)
  await unwrapUniV4Positions(api, uniV4ByNft)
  await unwrapPancakeInfinityCL(api, pcsInfinityIds)
}

module.exports = {
  methodology:
    'TVL is the sum of (1) native coin and USDT/USDC/USD1/wrapped-native balances held by the based.bid contract, plus (2) liquidity in Uniswap V3 and PancakeSwap V3 positions owned by based.bid, plus (3) Uniswap V4 and PancakeSwap Infinity CL positions registered on the based.bid contract (meme-token and flash-launch poolId entries on the official V4/Infinity position managers).',
  ethereum: { tvl },
  bsc:      { tvl },
  base:     { tvl },
  megaeth:  { tvl },
}
