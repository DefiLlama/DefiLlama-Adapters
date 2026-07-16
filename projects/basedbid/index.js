const ethers = require('ethers')
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
  megaeth:  '0x695e175c9704432cdFB98e3C193966F95a5F119D',
  robinhood: '0x6EC95a3C6C7b8368C9bF37Ff664672E55df3550d',
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
  megaeth: [
    ADDRESSES.null,
    ADDRESSES.megaeth.ETH,
    ADDRESSES.megaeth.USDT,
  ],
  robinhood: [
    ADDRESSES.null,
    ADDRESSES.robinhood.WETH,
    ADDRESSES.robinhood.USDG,
  ],
}

const WRAPPED_NATIVE = {
  ethereum: ADDRESSES.ethereum.WETH,
  bsc:      ADDRESSES.bsc.WBNB,
  base:     ADDRESSES.base.WETH,
  megaeth:  ADDRESSES.megaeth.ETH,
  robinhood: ADDRESSES.robinhood.WETH,
}

const SOL_PROGRAM_ID = new PublicKey('CuodpYRDz4k87K6ZUFxk7X8JkVv5dNVZAcTQX2TEzTef')
const SOL_APP_STORAGE = new PublicKey('VNRAfUMxvfeirwB1spXd78qGev5h2z8wWBd3Kay19ns')
const METEORA_DAMM_V2 = new PublicKey('cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG')
const RAYDIUM_CLMM = new PublicKey('CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK')
const SOL_USD1 = 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB'
const METEORA_DEX = 1

const TRACKED_TOKENS_SOL = [
  ADDRESSES.solana.SOL,
  ADDRESSES.solana.USDC,
  SOL_USD1,
]

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
  robinhood: [
    '0x73991a25c818bf1f1128deaab1492d45638de0d3',
    PANCAKE_V3_NFT,
  ],
}

// Uniswap V4 position managers (NFT = position manager; poolId = tokenId)
const UNIV4_POSM = {
  ethereum: '0xbD216513d74C8cf14cf4747E6AaA6420FF64ee9e',
  bsc:      '0x7A4a5c919aE2541AeD11041A1AEeE68f1287f95b',
  base:     '0x7C5f5A4bBd8fD63184577525326123B519429bDc',
  robinhood: '0x58daec3116aae6d93017baaea7749052e8a04fa7',
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
const OWNER_OF_ABI = 'function ownerOf(uint256 tokenId) view returns (address)'

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

async function getOwnedPositionIds(api, nftAddress, positionIds, owner) {
  if (!nftAddress || !positionIds.length) return []

  const owners = await api.multiCall({
    abi: OWNER_OF_ABI,
    target: nftAddress,
    calls: positionIds,
    permitFailure: true,
  })
  const expectedOwner = lc(owner)

  return positionIds.filter((_, i) => lc(owners[i]) === expectedOwner)
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

  const verifiedUniV4ByNft = {}
  for (const [nftAddress, ids] of Object.entries(uniV4ByNft)) {
    const ownedIds = await getOwnedPositionIds(api, nftAddress, [...ids], basedBid)
    if (ownedIds.length) verifiedUniV4ByNft[nftAddress] = ownedIds
  }

  return {
    uniV4ByNft: verifiedUniV4ByNft,
    pcsInfinityIds: await getOwnedPositionIds(api, PCS_INFINITY_POSM, [...pcsInfinityIds], basedBid),
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

async function addEvmLpPositions(api) {
  const owner = BASED_BID[api.chain]

  // Uniswap V3 + PancakeSwap V3 LP NFTs (ERC721Enumerable on the NFT manager).
  for (const nftAddress of UNIV3_LIKE_NFTS[api.chain] || []) {
    await sumTokens2({ api, owner, uniV3ExtraConfig: { nftAddress } })
  }

  // Uniswap V4 + PancakeSwap Infinity CL — position managers and tokenIds
  // come from the based.bid registry (meme + flash launch pools).
  const { uniV4ByNft, pcsInfinityIds } = await collectV4PositionsFromContract(api)
  await unwrapUniV4Positions(api, uniV4ByNft)
  await unwrapPancakeInfinityCL(api, pcsInfinityIds)
}

async function tvl(api) {
  const owner = BASED_BID[api.chain]

  // Native coin + stablecoins held directly by based.bid.
  await sumTokens2({ api, owner, tokens: TRACKED_TOKENS[api.chain] || [] })
  await addEvmLpPositions(api)
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

async function addMeteoraPositions(api, lockPdas) {
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
    if (amountA > 0n) api.add(pool.tokenAMint.toBase58(), amountA.toString())
    if (amountB > 0n) api.add(pool.tokenBMint.toBase58(), amountB.toString())
  })
}

function getClmmPositionPda(nftMint) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('position'), nftMint.toBuffer()],
    RAYDIUM_CLMM,
  )[0]
}

async function addRaydiumClmmPositions(api, lockPdas) {
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

  positions.forEach((position) => {
    const poolInfo = pools.get(position.poolId.toBase58())
    if (!poolInfo) return
    addUniV3LikePosition({
      api,
      token0: poolInfo.mintA.toBase58(),
      token1: poolInfo.mintB.toBase58(),
      liquidity: position.liquidity.toNumber(),
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
      tick: poolInfo.tickCurrent,
    })
  })
}

async function addTreasuryLockBalances(api, treasury, lock) {
  const connection = getConnection()
  const owners = [treasury, lock]
  const splMints = TRACKED_TOKENS_SOL.filter((m) => m !== ADDRESSES.solana.SOL)

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

  await addTreasuryLockBalances(api, appStorage.treasury, appStorage.lock)
  addBondingCurveReserves(api, memeTokens)

  const lockPdas = await program.account.lockPda.all()
  await addMeteoraPositions(api, lockPdas)
  await addRaydiumClmmPositions(api, lockPdas)
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: 'TVL includes (1) native coin and USDT/USDC/USD1/wrapped-native balances at the based.bid contract (EVM) or treasury/lock accounts (Solana), (2) active bonding-curve collateral on Solana, and (3) LP positions: Uniswap V3, Uniswap V4, PancakeSwap V3, and PancakeSwap Infinity CL positions owned by based.bid (EVM), plus Meteora DAMM v2 and Raydium CLMM positions controlled by based.bid lock PDAs (Solana).',
  ethereum: { tvl },
  bsc:      { tvl },
  base:     { tvl },
  megaeth:  { tvl },
  robinhood: { tvl },
  solana:   { tvl: solanaTvl },
}
