const ethers = require('ethers')
const sdk = require('@defillama/sdk')
const { PublicKey } = require('@solana/web3.js')
const { Program } = require('@project-serum/anchor')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs')
const { getProvider, getConnection, decodeAccount, getAssociatedTokenAddress } = require('../helper/solana')
const { getUniqueAddresses } = require('../helper/tokenMapping')
const { sliceIntoChunks } = require('../helper/utils')
const idl = require('./idl.json')

// based.bid contract addresses on each supported chain
const BASED_BID = {
  ethereum: '0x3cb3D9E659653de02D8e3Aecd4963Ba1Ae429682',
  bsc:      '0x920b4Ee4970CFE1ef523a0679200f9d9b2F87B2c',
  base:     '0x0F2C33F406D58144Dec03FCdb69571249F0b0286',
  robinhood: '0x6EC95a3C6C7b8368C9bF37Ff664672E55df3550d',
  arc:      '0x50C5939990CE22C5CF967cAB42a488eEa11945cB',
}

const USD1_ETH_BSC = ADDRESSES.bsc.USD1

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
  robinhood: [
    ADDRESSES.null,
    ADDRESSES.robinhood.WETH,
    ADDRESSES.robinhood.USDG,
  ],
  // Arc: native USDC (eth_getBalance, 18 decimals) and the 0x3600 ERC-20 (6 decimals) are one balance; count it once.
  arc: [
    ADDRESSES.arc.USDC,
    ADDRESSES.arc.EURC,
    ADDRESSES.arc.WETH,
  ],
}

const WRAPPED_NATIVE = {
  ethereum: ADDRESSES.ethereum.WETH,
  bsc:      ADDRESSES.bsc.WBNB,
  base:     ADDRESSES.base.WETH,
  robinhood: ADDRESSES.robinhood.WETH,
  arc:      ADDRESSES.arc.USDC,
}

const SOL_PROGRAM_ID = new PublicKey('CuodpYRDz4k87K6ZUFxk7X8JkVv5dNVZAcTQX2TEzTef')
const SOL_APP_STORAGE = new PublicKey('VNRAfUMxvfeirwB1spXd78qGev5h2z8wWBd3Kay19ns')
const METEORA_DAMM_V2 = new PublicKey('cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG')
const RAYDIUM_CLMM = new PublicKey('CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK')
const SOL_USD1 = 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB'
const METEORA_DEX = 1
const SOL_EMPTY_ACCOUNT = '11111111111111111111111111111111'

const TRACKED_TOKENS_SOL = [
  ADDRESSES.solana.SOL,
  ADDRESSES.solana.USDC,
  SOL_USD1,
]

const PANCAKE_V3_NFT = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364'

// Uniswap V3 + PancakeSwap V3 NonfungiblePositionManagers (ERC721Enumerable).
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
  robinhood: [
    '0x73991a25c818bf1f1128deaab1492d45638de0d3',
    PANCAKE_V3_NFT,
  ],
  arc: [
    '0x39654a85a4c05127f5fd6ed22caec077a0fb1377', // no PancakeSwap deployment on Arc
  ],
}

// Uniswap V4 position managers (NFT = position manager; poolId = tokenId).
// StateView addresses come from the helper defaults (robinhood + arc included).
const UNIV4_POSM = {
  ethereum: '0xbD216513d74C8cf14cf4747E6AaA6420FF64ee9e',
  bsc:      '0x7A4a5c919aE2541AeD11041A1AEeE68f1287f95b',
  base:     '0x7C5f5A4bBd8fD63184577525326123B519429bDc',
  robinhood: '0x58daec3116aae6d93017baaea7749052e8a04fa7',
  arc:      '0x6049c9a0e26405c0985f9e3685c87d0ae917f82b',
}

// PancakeSwap Infinity CL position managers + pool managers (BSC, Base, Robinhood).
const PCS_INFINITY = {
  bsc: {
    posm:        '0x55f4c8aba71a1e923edc303eb4feff14608cc226',
    poolManager: '0xa0FfB9c1CE1Fe56963B0321B32E7A0302114058b',
  },
  base: {
    posm:        '0x55f4c8aba71a1e923edc303eb4feff14608cc226',
    poolManager: '0xa0FfB9c1CE1Fe56963B0321B32E7A0302114058b',
  },
  robinhood: {
    posm:        '0xeaEA9253A0b75B936a965DbD35B2a3F01831DE74',
    poolManager: '0xeE04c68742e6Bf434bE8039580D2e89BBE55bc6f',
  },
}

const GET_MEME_TOKEN_LIST_ABI = 'function getMemeTokenList() view returns (address[])'
const GET_MEME_TOKEN_DATA_ABI =
  'function getMemeTokenData(address memeToken) view returns (tuple(address memeOwner, uint256 volumn, uint256 virtualReserveETH, uint256 virtualReserveToken, uint256 initialVirtualReserveETH, uint256 initialVirtualReserveToken, uint256 virtualReserveETHHardcap, uint256 virtualReserveETHSoftcap, bytes32 subBoard, bytes32 keyForXSale, uint8 package, bool isXSale, bool isListed, bool isCancelled, bool isTaxToken, uint8 _padding, tuple(address baseTokenForPair, uint256 liquidityForHardcap, uint256 liquidityForSoftcap, uint256 marketCap, uint256 maxAllocationPerUser, uint256 maxAllocationPerWhitelistedUser, bytes32 whitelistMerkleRoot, uint24 buyReferralFeePer, uint24 sellMemeTokenOwnerFeePer, uint24 buyMemeTokenOwnerFeePer, uint24 finalizeFeePer, uint24 delayTradeTime, uint40 startTime, uint40 endTime, bool isWhitelist, uint48 _padding, tuple(address routerOrPositionManager, uint256 poolId, uint24 fee, int24 tickSpacing, uint24 per, bool isLPBurn, uint8 _padding)[] dex, string metaData) initialData, tuple(uint24 buyFee, uint24 sellFee) fee, uint256 tokenVersion))'
const GET_FLASH_TOKEN_COUNT_ABI = 'function getTokenCountForFlashLaunchV4() view returns (uint256)'
const GET_FLASH_TOKEN_ABI = 'function getTokenForFlashLaunchV4(uint256 index) view returns (address token)'
const V4_HOOK_DATA_TUPLE =
  'tuple(bool hasV4Hook, tuple(uint16 liquidityFeeBps, uint16 buybackFeeBps, uint16 rewardFeeBps, address[] customWallets, uint16[] customWalletBps) hookFeeDistributionConfig, uint256 feeThreshold, address rewardToken, tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) rewardPoolKey, uint8 feeKind, uint24 staticPoolFeeBpsBuy, uint24 staticPoolFeeBpsSell, uint24 hookFeeBpsBuy, uint24 hookFeeBpsSell, tuple(uint24 minBaseFeeBpsBuy, uint24 minBaseFeeBpsSell, uint24 maxBaseFeeBpsBuy, uint24 maxBaseFeeBpsSell, uint32 baseFeeFactorBuy, uint32 baseFeeFactorSell, uint24 defaultBaseFeeBpsBuy, uint24 defaultBaseFeeBpsSell, uint32 surgeDecayPeriodSeconds, uint32 surgeMultiplierPpm, bool perSwapMode, uint32 capAutoTuneStepPpm, uint32 capAutoTuneIntervalSeconds) dynamicFeeConfig, tuple(uint16[] buyFeesBps, uint16[] sellFeesBps, uint256[] buyFeeTierAmountLevels, uint256[] sellFeeTierAmountLevels) tieredFeeConfig, uint48 protectPeriod, uint256 maxBuyPerOrigin, bool isAntiSandwich, uint32 cooldownSeconds, uint24 penaltyFeeBps, tuple(uint32 volumeIntervalSeconds, uint256[] volumeLevels, uint16[] volumeMultiplierBps) volumeConfig)'
const GET_FLASH_POOL_DATA_ABI =
  `function getFlashLaunchV4PoolData(address tokenAddress) view returns (tuple(address owner, bool isTokenBurn, uint8 _padding1, address baseToken, uint8 _padding2, bytes32 subBoard, string metaData, address positionManager, uint8 _padding3, uint256 poolId, address hooks, ${V4_HOOK_DATA_TUPLE} v4HookData))`
const GET_FLASH_V3_TOKEN_COUNT_ABI = 'function getTokenCountForFlashLaunchV3() view returns (uint256)'
const GET_FLASH_V3_TOKEN_ABI = 'function getTokenForFlashLaunchV3(uint256 index) view returns (address token)'
const GET_LIQUIDITY_V4_LIST_ABI = 'function getLiquidityV4List() view returns (address[] tokens)'
const GET_LIQUIDITY_V4_POOL_DATA_ABI =
  `function getLiquidityV4Pooldata(address token) view returns (tuple(address owner, bool isTokenBurn, address baseToken, bytes32 subBoard, string metaData, address positionManager, uint256 poolId, address hooks, ${V4_HOOK_DATA_TUPLE} v4HookData, tuple(bool isWhitelist, uint256 maxBuyPerOrigin) whitelistOption) poolData)`
const GET_LP_LOCK_ABI = 'function getLpLock(address positionManager) view returns (address)'
const FEE_RECEIVER_OF_ABI = 'function feeReceiverOf(uint256 tokenId) view returns (address)'
const TOKEN_OF_OWNER_BY_INDEX_ABI = 'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)'

const PCS_INFINITY_POSITIONS_ABI =
  'function positions(uint256) view returns ((address currency0, address currency1, address hooks, address poolManager, uint24 fee, bytes32 parameters) poolKey, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, address subscriber)'
const SLOT0_ABI =
  'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'
const OWNER_OF_ABI = 'function ownerOf(uint256 tokenId) view returns (address)'

function lc(addr) {
  return addr?.toLowerCase()
}

function isUniV4Posm(chain, positionManager) {
  const expected = UNIV4_POSM[chain]
  return expected && lc(positionManager) === lc(expected)
}

function isPcsInfinityPosm(chain, positionManager) {
  const cfg = PCS_INFINITY[chain]
  return !!cfg && lc(positionManager) === lc(cfg.posm)
}

function poolIdIsActive(poolId) {
  try {
    return BigInt(poolId) > 0n
  } catch {
    return Number(poolId) > 0
  }
}

// LP NFTs minted by based.bid are deposited into permanent lock contracts (one lock per
// position manager, registered on the diamond through LpLockFacet). Earlier positions were
// migrated into the locks as well, so the locks are the custodians of the LP; the diamond is
// kept as a fallback owner for positions on a position manager without a registered lock.
async function getLpCustodians(api) {
  const chain = api.chain
  const basedBid = BASED_BID[chain]
  const positionManagers = getUniqueAddresses([
    ...(UNIV3_LIKE_NFTS[chain] || []),
    UNIV4_POSM[chain],
    PCS_INFINITY[chain]?.posm,
  ].filter(Boolean), chain)

  const locks = await api.multiCall({
    abi: GET_LP_LOCK_ABI,
    target: basedBid,
    calls: positionManagers,
  })

  const lockOf = {}
  positionManagers.forEach((pm, i) => {
    const lock = locks[i]
    if (lock && lc(lock) !== ADDRESSES.null) lockOf[lc(pm)] = lc(lock)
  })

  return {
    lockOf,
    ownersFor: (positionManager) => getUniqueAddresses([basedBid, lockOf[lc(positionManager)]].filter(Boolean), chain),
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

async function getOwnedPositionIds(api, nftAddress, positionIds, owners) {
  if (!nftAddress || !positionIds.length || !owners.length) return []

  const holders = await api.multiCall({
    abi: OWNER_OF_ABI,
    target: nftAddress,
    calls: positionIds,
    permitFailure: true,
  })
  const accepted = new Set(owners.map(lc))

  return positionIds.filter((_, i) => accepted.has(lc(holders[i])))
}

async function readRegistry(api, custodians) {
  const chain = api.chain
  const basedBid = BASED_BID[chain]
  const uniV4ByNft = {}
  const pcsInfinityIds = new Set()
  const ctx = { uniV4ByNft, pcsInfinityIds }
  // Tokens launched through based.bid (never counted) and the quote tokens they are paired with.
  // Projects can launch against any quote token, so the quote side is not limited to a fixed list.
  const launchedTokens = new Set()
  const quoteTokens = new Set()
  const addLaunched = (token) => { if (token) launchedTokens.add(lc(token)) }
  const addQuote = (token) => { if (token) quoteTokens.add(lc(token)) }

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
    memeTokens.forEach(addLaunched)
    memeDataList.forEach((data) => {
      if (!data) return
      addQuote(data.initialData?.baseTokenForPair)
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
    flashTokens.forEach(addLaunched)
    poolDataList.forEach((poolData) => {
      if (!poolData) return
      addQuote(poolData.baseToken)
      registerPosition(ctx, chain, poolData.positionManager, poolData.poolId)
    })
  }

  const liquidityV4Tokens = await api.call({
    target: basedBid,
    abi: GET_LIQUIDITY_V4_LIST_ABI,
  }) || []

  if (liquidityV4Tokens.length) {
    const liquidityV4PoolDataList = await api.multiCall({
      target: basedBid,
      abi: GET_LIQUIDITY_V4_POOL_DATA_ABI,
      calls: liquidityV4Tokens,
      permitFailure: true,
    })
    liquidityV4Tokens.forEach(addLaunched)
    liquidityV4PoolDataList.forEach((poolData) => {
      if (!poolData) return
      addQuote(poolData.baseToken)
      registerPosition(ctx, chain, poolData.positionManager, poolData.poolId)
    })
  }

  // Flash launches on V3-style DEXes: the LP NFTs are enumerated from the position managers,
  // only the launched token list is needed here.
  const flashV3Count = Number(await api.call({
    target: basedBid,
    abi: GET_FLASH_V3_TOKEN_COUNT_ABI,
  }) || 0)

  if (flashV3Count > 0) {
    const flashV3Tokens = await api.multiCall({
      target: basedBid,
      abi: GET_FLASH_V3_TOKEN_ABI,
      calls: Array.from({ length: flashV3Count }, (_, i) => ({ params: [i] })),
    })
    flashV3Tokens.forEach(addLaunched)
  }

  // Keep only positions actually held by the lock contract (or the diamond itself).
  const verifiedUniV4ByNft = {}
  for (const [nftAddress, ids] of Object.entries(uniV4ByNft)) {
    const ownedIds = await getOwnedPositionIds(api, nftAddress, [...ids], custodians.ownersFor(nftAddress))
    if (ownedIds.length) verifiedUniV4ByNft[nftAddress] = ownedIds
  }

  const pcsPosm = PCS_INFINITY[chain]?.posm
  return {
    launchedTokens: [...launchedTokens],
    quoteTokens: [...quoteTokens].filter((token) => !launchedTokens.has(token)),
    uniV4ByNft: verifiedUniV4ByNft,
    pcsInfinityIds: pcsPosm
      ? await getOwnedPositionIds(api, pcsPosm, [...pcsInfinityIds], custodians.ownersFor(pcsPosm))
      : [],
  }
}

// Locks are permissionless and shared across diamonds: count a locked position only if this diamond is its fee receiver.
async function getV3PositionIds(api, nftAddress, custodians) {
  const basedBid = lc(BASED_BID[api.chain])
  const lock = custodians.lockOf[lc(nftAddress)]
  const ids = []
  for (const owner of custodians.ownersFor(nftAddress)) {
    const count = Number(await api.call({ abi: 'erc20:balanceOf', target: nftAddress, params: [owner] }))
    if (!count) continue
    const ownerIds = await api.multiCall({
      abi: TOKEN_OF_OWNER_BY_INDEX_ABI,
      target: nftAddress,
      calls: Array.from({ length: count }, (_, i) => ({ params: [owner, i] })),
    })
    if (lc(owner) !== lock) {
      ids.push(...ownerIds)
      continue
    }
    const receivers = await api.multiCall({ abi: FEE_RECEIVER_OF_ABI, target: lock, calls: ownerIds })
    ids.push(...ownerIds.filter((_, i) => lc(receivers[i]) === basedBid))
  }
  return ids
}

async function unwrapUniV4Positions(api, uniV4ByNft, launchedTokens) {
  for (const [nftAddress, positionIds] of Object.entries(uniV4ByNft)) {
    if (!positionIds.length) continue
    await sumTokens2({
      api,
      uniV4ExtraConfig: {
        nftAddress,
        positionIds,
      },
      blacklistedTokens: launchedTokens,
    })
  }
}

async function unwrapPancakeInfinityCL(api, positionIds, launchedTokens) {
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
  const launched = new Set(launchedTokens)

  validIdx.forEach((i, j) => {
    const pos = positions[i]
    const slot = slot0[j]
    if (!pos || !slot || !pos.liquidity || pos.liquidity == 0) return

    const token0 = pos.poolKey.currency0 === ADDRESSES.null ? wrappedNative : pos.poolKey.currency0
    const token1 = pos.poolKey.currency1 === ADDRESSES.null ? wrappedNative : pos.poolKey.currency1

    // Compute both sides on a scratch api, then keep only the quote (non-launched) side.
    const scratch = new sdk.ChainApi({ chain: api.chain })
    addUniV3LikePosition({
      api: scratch,
      token0,
      token1,
      liquidity: pos.liquidity,
      tickLower: Number(pos.tickLower),
      tickUpper: Number(pos.tickUpper),
      tick: Number(slot.tick),
    })
    Object.entries(scratch.getBalances()).forEach(([key, amount]) => {
      const token = key.slice(key.indexOf(':') + 1)
      if (!launched.has(lc(token))) api.add(token, amount)
    })
  })
}

async function tvl(api) {
  const owner = BASED_BID[api.chain]
  const custodians = await getLpCustodians(api)
  const { launchedTokens, quoteTokens, uniV4ByNft, pcsInfinityIds } = await readRegistry(api, custodians)

  // Native coin, core assets and every quote token used by a listed project, held directly by
  // based.bid (e.g. funds raised by launches that are still on the bonding curve).
  let tokens = getUniqueAddresses([...(TRACKED_TOKENS[api.chain] || []), ...quoteTokens], api.chain)
  if (api.chain === 'arc') tokens = tokens.filter((token) => token !== ADDRESSES.null)
  await sumTokens2({ api, owner, tokens, blacklistedTokens: launchedTokens })

  // Uniswap V3 + PancakeSwap V3 LP NFTs (ERC721Enumerable on the NFT manager), held by the
  // lock contract registered for that position manager (diamond as fallback). Every token
  // except the launched ones counts, so any quote token is tracked.
  for (const nftAddress of UNIV3_LIKE_NFTS[api.chain] || []) {
    const positionIds = await getV3PositionIds(api, nftAddress, custodians)
    if (!positionIds.length) continue
    await sumTokens2({
      api,
      uniV3ExtraConfig: { nftAddress, positionIds },
      blacklistedTokens: launchedTokens,
    })
  }

  // Uniswap V4 + PancakeSwap Infinity CL: position managers and tokenIds
  // come from the based.bid registry (meme + flash launch + manual liquidity pools).
  await unwrapUniV4Positions(api, uniV4ByNft, launchedTokens)
  await unwrapPancakeInfinityCL(api, pcsInfinityIds, launchedTokens)
}

function deriveMeteoraPositionPda(nftMint) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('position'), new PublicKey(nftMint).toBuffer()],
    METEORA_DAMM_V2,
  )[0]
}

function readPubkey(data, offset) {
  return new PublicKey(data.subarray(offset, offset + 32))
}

function readU128LE(data, offset) {
  return BigInt(`0x${data.subarray(offset, offset + 16).reverse().toString('hex')}`)
}

function readU64LE(data, offset) {
  return BigInt(data.readBigUInt64LE(offset))
}

function decodeMeteoraPosition(data) {
  if (data.length < 200) return null
  const pool = readPubkey(data, 8)
  const unlocked = readU128LE(data, 152)
  const vested = readU128LE(data, 168)
  const permanent = readU128LE(data, 184)
  const liquidity = unlocked + vested + permanent
  if (liquidity <= 0n) return null
  return { pool, liquidity }
}

function decodeMeteoraPool(data) {
  if (data.length < 696) return null
  const tokenAMint = readPubkey(data, 168)
  const tokenBMint = readPubkey(data, 200)
  const poolLiquidity = readU128LE(data, 360)
  const tokenAAmount = readU64LE(data, 680)
  const tokenBAmount = readU64LE(data, 688)
  if (poolLiquidity <= 0n) return null
  return { tokenAMint, tokenBMint, poolLiquidity, tokenAAmount, tokenBAmount }
}

function allocateShare(amount, shareNum, shareDen) {
  if (shareDen <= 0n || amount <= 0n) return 0n
  return (amount * shareNum) / shareDen
}

async function addMeteoraPositions(api, lockPdas, quoteMints) {
  const meteoraLocks = lockPdas.filter((l) => Number(l.account.dex) === METEORA_DEX && l.account.feeNftMint)
  if (!meteoraLocks.length) return

  const connection = getConnection()
  const positionPdas = meteoraLocks.map((l) => deriveMeteoraPositionPda(l.account.feeNftMint))
  const positions = await connection.getMultipleAccountsInfo(positionPdas)

  const poolIds = []
  const decodedPositions = []
  positions.forEach((acc, i) => {
    if (!acc?.data) return
    const pos = decodeMeteoraPosition(acc.data)
    if (!pos) return
    decodedPositions.push(pos)
    poolIds.push(pos.pool)
  })
  if (!decodedPositions.length) return

  const allow = new Set(quoteMints)

  const poolAccounts = await connection.getMultipleAccountsInfo(poolIds)
  poolAccounts.forEach((acc, i) => {
    if (!acc?.data) return
    const pool = decodeMeteoraPool(acc.data)
    const pos = decodedPositions[i]
    if (!pool || !pos) return

    const shareNum = pos.liquidity
    const shareDen = pool.poolLiquidity
    const amountA = allocateShare(pool.tokenAAmount, shareNum, shareDen)
    const amountB = allocateShare(pool.tokenBAmount, shareNum, shareDen)
    const mintA = pool.tokenAMint.toBase58()
    const mintB = pool.tokenBMint.toBase58()
    if (amountA > 0n && allow.has(mintA)) api.add(mintA, amountA.toString())
    if (amountB > 0n && allow.has(mintB)) api.add(mintB, amountB.toString())
  })
}

function getClmmPositionPda(nftMint) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('position'), nftMint.toBuffer()],
    RAYDIUM_CLMM,
  )[0]
}

async function addRaydiumClmmPositions(api, lockPdas, quoteMints) {
  const nftMints = lockPdas
    .filter((l) => Number(l.account.dex) !== METEORA_DEX && l.account.feeNftMint)
    .map((l) => l.account.feeNftMint)

  if (!nftMints.length) return

  const connection = getConnection()
  const positionPdas = nftMints.map((mint) => getClmmPositionPda(mint))
  const positions = []
  const pools = new Map()

  for (const chunk of sliceIntoChunks(positionPdas, 50)) {
    const accounts = await connection.getMultipleAccountsInfo(chunk)
    accounts.forEach((account) => {
      if (!account || account.owner.toBase58() !== RAYDIUM_CLMM.toBase58()) return
      positions.push(decodeAccount('raydiumPositionInfo', account))
    })
  }

  if (!positions.length) return

  const poolIds = getUniqueAddresses(positions.map((p) => p.poolId.toBase58()), 'solana')
  for (const chunk of sliceIntoChunks(poolIds, 50)) {
    const poolAccounts = await connection.getMultipleAccountsInfo(chunk.map((i) => new PublicKey(i)))
    chunk.forEach((poolId, i) => {
      const poolAccount = poolAccounts[i]
      if (!poolAccount) return
      pools.set(poolId, decodeAccount('raydiumCLMM', poolAccount))
    })
  }

  const allow = new Set(quoteMints)
  const memeMints = new Set()

  positions.forEach((position) => {
    const poolInfo = pools.get(position.poolId.toBase58())
    if (!poolInfo) return
    const token0 = poolInfo.mintA.toBase58()
    const token1 = poolInfo.mintB.toBase58()
    addUniV3LikePosition({
      api,
      token0,
      token1,
      liquidity: position.liquidity.toNumber(),
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
      tick: poolInfo.tickCurrent,
    })
    if (!allow.has(token0)) memeMints.add(token0)
    if (!allow.has(token1)) memeMints.add(token1)
  })

  memeMints.forEach((mint) => api.removeTokenBalance(mint))
}

async function addTreasuryLockBalances(api, treasury, lock, quoteMints) {
  const connection = getConnection()
  const owners = [treasury, lock]
  const splMints = quoteMints.filter((m) => m !== ADDRESSES.solana.SOL)

  for (const owner of owners) {
    const lamports = await connection.getBalance(new PublicKey(owner))
    if (lamports > 0) api.add(ADDRESSES.solana.SOL, lamports)
  }

  const atas = owners.flatMap((owner) =>
    splMints.map((mint) => new PublicKey(getAssociatedTokenAddress(mint, owner))),
  )
  const accounts = await connection.getMultipleAccountsInfo(atas)
  accounts.forEach((acc) => {
    if (!acc) return
    const { mint, amount } = decodeAccount('tokenAccount', acc)
    if (+amount > 0) api.add(mint.toBase58(), amount.toString())
  })
}

function addBondingCurveReserves(api, memeTokens) {
  memeTokens.forEach(({ account }) => {
    if (account.isListed || account.isCancelled) return

    const raised = BigInt(account.virtualReserveSol) - BigInt(account.initialVirtualReserveSol)
    if (raised <= 0n) return

    const baseMint = account.initialData.baseTokenForPair.toBase58()
    if (baseMint === SOL_EMPTY_ACCOUNT) return
    api.add(baseMint, raised.toString())
  })
}

async function solanaTvl(api) {
  const provider = getProvider()
  const program = new Program(idl, SOL_PROGRAM_ID, provider)

  const [appStorage, memeTokens] = await Promise.all([
    program.account.appStorage.fetch(SOL_APP_STORAGE),
    program.account.memeTokenData.all()
  ])

  // Projects can launch against any quote token: track the core assets plus every quote
  // mint used by a listed project.
  const quoteMints = [...new Set([
    ...TRACKED_TOKENS_SOL,
    ...memeTokens
      .map(({ account }) => account.initialData.baseTokenForPair.toBase58())
      .filter((mint) => mint !== SOL_EMPTY_ACCOUNT),
  ])]

  await addTreasuryLockBalances(api, appStorage.treasury, appStorage.lock, quoteMints)
  addBondingCurveReserves(api, memeTokens)

  const lockPdas = await program.account.lockPda.all()
  await addMeteoraPositions(api, lockPdas, quoteMints)
  await addRaydiumClmmPositions(api, lockPdas, quoteMints)
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: 'TVL includes (1) balances of the native coin, core assets and every quote token used by a listed project at the based.bid contract (EVM) or treasury/lock accounts (Solana), (2) active bonding-curve collateral on Solana, and (3) the quote-token side of LP positions (tokens launched on based.bid are excluded): Uniswap V3, Uniswap V4, PancakeSwap V3, and PancakeSwap Infinity CL positions held by the based.bid LP lock contracts (permanent lockers registered on the based.bid contract per position manager) on EVM, plus Meteora DAMM v2 and Raydium CLMM positions controlled by based.bid lock PDAs (Solana).',
  ethereum: { tvl },
  bsc:      { tvl },
  base:     { tvl },
  robinhood: { tvl },
  arc:      { tvl },
  megaeth: { tvl: () => ({}) },
  solana:   { tvl: solanaTvl },
}
