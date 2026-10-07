const { ethers } = require('ethers')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, addUniV3LikePosition, unwrapSlipstreamNFT } = require('../helper/unwrapLPs')

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
  slot0v4: 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
  slipPositions: 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 f0, uint256 f1, uint128 o0, uint128 o1)',
  clGetPool: 'function getPool(address tokenA, address tokenB, int24 tickSpacing) view returns (address)',
  slot0v3: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 obsIndex, uint16 obsCard, uint16 obsCardNext, bool unlocked)',
}

const coder = ethers.AbiCoder.defaultAbiCoder()
// Hook-side positions are ERC-6909 ids keyed by pool and range.
const rangeId = (poolKey, tickLower, tickUpper) =>
  ethers.keccak256(coder.encode(['bytes32', 'int24', 'int24'], [poolKey, tickLower, tickUpper]))

// Settlement assets a vault can hold without any position open against them.
// Everything else the vaults deal in is discovered from their own positions
// rather than hardcoded, so a new listing needs no change here.
const BASE_TOKENS = [
  '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', // USDG
  '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', // WETH
]

async function tvl(api) {
  const logs = await getLogs({
    api, target: FACTORY, eventAbi: VAULT_DEPLOYED, onlyArgs: true, fromBlock: FROM_BLOCK,
  })
  const vaults = [...new Set(logs.map(l => l.core))]

  const tokens = new Set(BASE_TOKENS)
  const positionSets = await api.multiCall({ abi: abi.getPositions, calls: vaults })
  const items = []
  positionSets.forEach((ids, i) => ids.forEach(id => items.push({ vault: vaults[i], id })))

  if (items.length) {
    const [families, nfpms] = await Promise.all([
      api.multiCall({ abi: abi.positionFamily, calls: items.map(p => ({ target: p.vault, params: [p.id] })) }),
      api.multiCall({ abi: abi.positionNfpm, calls: items.map(p => ({ target: p.vault, params: [p.id] })) }),
    ])
    items.forEach((p, i) => { p.family = +families[i]; p.nfpm = nfpms[i] })

    const [slipTokens, hookTokens] = [
      await addSlipstreamPositions(api, items.filter(p => p.nfpm.toLowerCase() === SLIPSTREAM_NFPM.toLowerCase())),
      await addHookPositions(api, items.filter(p => p.nfpm.toLowerCase() !== SLIPSTREAM_NFPM.toLowerCase())),
    ]
    slipTokens.concat(hookTokens).forEach(t => tokens.add(t))
  }

  // Vaults with no open positions can still hold idle balances, so this runs
  // regardless of whether any positions were found.
  await sumTokens2({ api, owners: vaults, tokens: [...tokens] })
}

// up. concentrated liquidity. Position ids come from the vault, so gauge-staked
// positions count even though the gauge holds the NFT.
async function addSlipstreamPositions(api, items) {
  if (!items.length) return []
  const positionIds = items.map(p => p.id)
  await unwrapSlipstreamNFT({ api, positionIds, nftAddress: SLIPSTREAM_NFPM })
  const positions = await api.multiCall({ abi: abi.slipPositions, target: SLIPSTREAM_NFPM, calls: positionIds })
  return positions.flatMap(p => [p.token0, p.token1])
}

// Uniswap v4 hook pools. Each position carries an encoded reference that the
// family's lens resolves into a pool key and tick range; the vault's share of
// that range is its ERC-6909 balance on the hook, which already includes staked shares.
async function addHookPositions(api, items) {
  if (!items.length) return []
  // The lens registry is per-vault state, so it has to be read against the
  // vault that holds the position rather than against any one of them.
  const lenses = await api.multiCall({
    abi: abi.lensForFamily, calls: items.map(p => ({ target: p.vault, params: [p.family] })),
  })
  items.forEach((p, i) => { p.lens = lenses[i] })

  // A family with no registered lens cannot be valued, and skipping it would
  // understate TVL silently, so fail loudly instead.
  const missing = items.filter(p => p.lens === ethers.ZeroAddress)
  if (missing.length)
    throw new Error(`crossbow: no lens for position family ${[...new Set(missing.map(p => p.family))].join(', ')}`)
  const withLens = items

  const refs = await api.multiCall({
    abi: abi.alienRefOf, calls: withLens.map(p => ({ target: p.vault, params: [p.id] })),
  })
  const decoded = await api.multiCall({
    abi: abi.decode,
    calls: withLens.map((p, i) => ({ target: p.lens, params: [p.nfpm, refs[i]] })),
  })

  const resolved = withLens.map((p, i) => ({ ...p, d: decoded[i] }))
  const ids = resolved.map(p => rangeId(p.d.poolKey, p.d.tickLower, p.d.tickUpper))
  // stake() leaves the ERC-6909 balance in place - withdraw takes balanceOf minus
  // staked - so balanceOf already covers staked shares and must not be added to.
  const [shares, slot0s] = await Promise.all([
    api.multiCall({ abi: abi.erc6909Balance, calls: resolved.map((p, i) => ({ target: p.nfpm, params: [p.vault, ids[i]] })) }),
    api.multiCall({ abi: abi.slot0v4, target: STATE_VIEW, calls: resolved.map(p => p.d.poolKey) }),
  ])

  resolved.forEach((p, i) => {
    const liquidity = BigInt(shares[i])
    if (!liquidity) return
    addUniV3LikePosition({
      api, token0: p.d.currency0, token1: p.d.currency1, liquidity: liquidity.toString(),
      tickLower: +p.d.tickLower, tickUpper: +p.d.tickUpper, tick: +slot0s[i].tick,
    })
  })
  return resolved.flatMap(p => [p.d.currency0, p.d.currency1])
}

module.exports = {
  methodology:
    'Vaults are enumerated from the ManifoldFactoryRH VaultDeployed event. Each vault reports its open positions; up. concentrated-liquidity positions are valued from the position manager by token id, and Uniswap v4 hook positions are resolved through the per-family lens into a pool key and tick range, with the vault\'s liquidity read as its ERC-6909 balance on the hook, which already includes staked shares. Idle balances held by the vaults are added for every token their own positions reference, plus the chain\'s settlement assets. Doublecounted against the underlying DEXs.',
  doublecounted: true,
  robinhood: { tvl },
}
