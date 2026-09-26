const { ethers } = require('ethers')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs')

// ManifoldFactoryRH - deploys one vault per depositor
const FACTORY = '0x27658bD271449cD7467Cdb0FD6E6C32F789E9eFB'
const FROM_BLOCK = 64574208
const VAULT_DEPLOYED = 'event VaultDeployed(address indexed core, address indexed vaultOwner, uint256 indexed genId, bytes32 salt)'

const STATE_VIEW = '0xf3334192d15450cdd385c8b70e03f9a6bd9e673b' // Uniswap v4 StateView
const SLIPSTREAM_NFPM = '0x07F44c47743A2f36414A82b9F558ECFCf0EEdCEf' // up. CL position manager

const abi = {
  getPositions: 'function getPositions() view returns (uint256[])',
  positionFamily: 'function positionFamily(uint256) view returns (uint16)',
  positionNfpm: 'function positionNfpm(uint256) view returns (address)',
  alienRefOf: 'function alienRefOf(uint256) view returns (bytes)',
  lensForFamily: 'function lensForFamily(uint16) view returns (address)',
  decode: 'function decode(address nfpm, bytes ref) view returns (bytes32 poolKey, address currency0, address currency1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 a, uint256 b, uint256 c)',
  erc6909Balance: 'function balanceOf(address owner, uint256 id) view returns (uint256)',
  userPosition: 'function userPosition(uint256 id, address owner) view returns (uint128 staked, uint128 owed0, uint128 owed1, uint256 c0, uint256 c1, uint256 s0, uint256 s1, uint256 f0, uint256 f1)',
  slot0v4: 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
  slipPositions: 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 f0, uint256 f1, uint128 o0, uint128 o1)',
  clGetPool: 'function getPool(address tokenA, address tokenB, int24 tickSpacing) view returns (address)',
  slot0v3: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 obsIndex, uint16 obsCard, uint16 obsCardNext, bool unlocked)',
}

const coder = ethers.AbiCoder.defaultAbiCoder()
// Hook-side positions are ERC-6909 ids keyed by pool and range.
const rangeId = (poolKey, tickLower, tickUpper) =>
  ethers.keccak256(coder.encode(['bytes32', 'int24', 'int24'], [poolKey, tickLower, tickUpper]))

// Idle balances held by vaults between rotations
const IDLE_TOKENS = [
  '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', // USDG
  '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', // WETH
  '0x57C0E45cB534413D1C20A4240955d6bB250BB4F1', // UP
  '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9', // AAPL
  '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA
  '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', // TSLA
  '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C', // SPY
  '0x12f190a9F9d7D37a250758b26824B97CE941bF54', // AMZN
  '0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35', // META
]

async function tvl(api) {
  const logs = await getLogs({
    api, target: FACTORY, eventAbi: VAULT_DEPLOYED, onlyArgs: true, fromBlock: FROM_BLOCK,
  })
  const vaults = [...new Set(logs.map(l => l.core))]

  const positionSets = await api.multiCall({ abi: abi.getPositions, calls: vaults })
  const items = []
  positionSets.forEach((ids, i) => ids.forEach(id => items.push({ vault: vaults[i], id })))

  if (items.length) {
    const [families, nfpms] = await Promise.all([
      api.multiCall({ abi: abi.positionFamily, calls: items.map(p => ({ target: p.vault, params: [p.id] })) }),
      api.multiCall({ abi: abi.positionNfpm, calls: items.map(p => ({ target: p.vault, params: [p.id] })) }),
    ])
    items.forEach((p, i) => { p.family = +families[i]; p.nfpm = nfpms[i] })

    await addSlipstreamPositions(api, items.filter(p => p.nfpm.toLowerCase() === SLIPSTREAM_NFPM.toLowerCase()))
    await addHookPositions(api, items.filter(p => p.nfpm.toLowerCase() !== SLIPSTREAM_NFPM.toLowerCase()))
  }

  // Vaults with no open positions can still hold idle balances, so this runs
  // regardless of whether any positions were found.
  await sumTokens2({ api, owners: vaults, tokens: IDLE_TOKENS })
}

// up. concentrated liquidity, held as NFTs and read by token id so that
// gauge-staked positions still count.
async function addSlipstreamPositions(api, items) {
  if (!items.length) return
  const positions = await api.multiCall({
    abi: abi.slipPositions, target: SLIPSTREAM_NFPM, calls: items.map(p => p.id),
  })
  const live = positions.filter(p => p.liquidity !== '0')
  if (!live.length) return

  const clFactory = await api.call({ abi: 'address:factory', target: SLIPSTREAM_NFPM })
  const pools = await api.multiCall({
    abi: abi.clGetPool, target: clFactory,
    calls: live.map(p => ({ params: [p.token0, p.token1, p.tickSpacing] })),
  })
  const slot0s = await api.multiCall({ abi: abi.slot0v3, calls: pools })

  live.forEach((p, i) => {
    addUniV3LikePosition({
      api, token0: p.token0, token1: p.token1, liquidity: p.liquidity,
      tickLower: +p.tickLower, tickUpper: +p.tickUpper, tick: +slot0s[i].tick,
    })
  })
}

// Uniswap v4 hook pools. Each position carries an encoded reference that the
// family's lens resolves into a pool key and tick range; the vault's share of
// that range is an ERC-6909 balance on the hook, plus whatever it has staked.
async function addHookPositions(api, items) {
  if (!items.length) return
  // The lens registry is per-vault state, so it has to be read against the
  // vault that holds the position rather than against any one of them.
  const lenses = await api.multiCall({
    abi: abi.lensForFamily, calls: items.map(p => ({ target: p.vault, params: [p.family] })),
  })
  items.forEach((p, i) => { p.lens = lenses[i] })

  // A family without a registered lens has no way to resolve its encoded
  // reference, so those positions are skipped rather than guessed at.
  const withLens = items.filter(p => p.lens !== ethers.ZeroAddress)
  if (!withLens.length) return

  const refs = await api.multiCall({
    abi: abi.alienRefOf, calls: withLens.map(p => ({ target: p.vault, params: [p.id] })),
  })
  const decoded = await api.multiCall({
    abi: abi.decode,
    calls: withLens.map((p, i) => ({ target: p.lens, params: [p.nfpm, refs[i]] })),
  })

  const resolved = withLens.map((p, i) => ({ ...p, d: decoded[i] }))
  const ids = resolved.map(p => rangeId(p.d.poolKey, p.d.tickLower, p.d.tickUpper))
  const [unstaked, staked, slot0s] = await Promise.all([
    api.multiCall({ abi: abi.erc6909Balance, calls: resolved.map((p, i) => ({ target: p.nfpm, params: [p.vault, ids[i]] })) }),
    api.multiCall({ abi: abi.userPosition, calls: resolved.map((p, i) => ({ target: p.nfpm, params: [ids[i], p.vault] })) }),
    api.multiCall({ abi: abi.slot0v4, target: STATE_VIEW, calls: resolved.map(p => p.d.poolKey) }),
  ])

  resolved.forEach((p, i) => {
    const liquidity = BigInt(unstaked[i]) + BigInt(staked[i].staked)
    if (!liquidity) return
    addUniV3LikePosition({
      api, token0: p.d.currency0, token1: p.d.currency1, liquidity: liquidity.toString(),
      tickLower: +p.d.tickLower, tickUpper: +p.d.tickUpper, tick: +slot0s[i].tick,
    })
  })
}

module.exports = {
  methodology:
    'Vaults are enumerated from the ManifoldFactoryRH VaultDeployed event. Each vault reports its open positions; up. concentrated-liquidity positions are valued from the position manager by token id, and Uniswap v4 hook positions are resolved through the per-family lens into a pool key and tick range, with the vault\'s liquidity read as its ERC-6909 balance plus staked amount on the hook. Idle token balances held by the vaults are added. Doublecounted against the underlying DEXs.',
  doublecounted: true,
  robinhood: { tvl },
}
