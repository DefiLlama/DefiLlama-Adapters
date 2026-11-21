const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')
const { staking } = require('../helper/staking')

// Tidewell: automated Uniswap v3/v4 liquidity vaults on Robinhood Chain (https://tidewellfi.app).
// Every user gets their own vault clone from a factory. A vault holds the user's Uniswap position NFTs
// (one per position, or one per band for shaped positions) plus tokens waiting to be reinvested.
// Contracts: https://github.com/tidewellfi/tidewell-contracts
const FACTORIES = [
  '0xD4015691BCA893a8B4D50A15B4fdA5151b7CAa11', // vaults (single range)
  '0x413fC35319A01aE74f14Ad211CCBD907dee2bB02', // shaped vaults (liquidity spread over bands)
]
const SHAPED_FACTORY = FACTORIES[1].toLowerCase()
const FROM_BLOCK = 108830067
const KIND_V4 = 1

const TIDE = '0x5dd89189769deB28E1e24fB8623e28856B6B5300'
const THE_WELL = '0xD5277bae0AdA4ce2FBFD9dd2c6bA4289907fB5fb' // TIDE staking

const settings = 'tuple(int24 minWidth, int24 maxWidth, uint32 cooldown, uint16 compoundBps, uint16 slippageBps, uint8 rule)'
const shapedSettings = 'tuple(int24 minWidth, int24 maxWidth, uint32 cooldown, uint16 compoundBps, uint16 slippageBps, uint8 rule, uint32 outDelay)'
const poolKey = 'tuple(address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks)'
const abis = {
  vaultCreated: 'event VaultCreated(address indexed user, uint8 kind, address vault)',
  positionIds: 'function positionIds() view returns (uint256[])',
  v3: `function getPosition(uint256 id) view returns (tuple(uint256 tokenId, address pool, address token0, address token1, uint24 fee, int24 tickSpacing, uint32 lastMove, ${settings}))`,
  v4: `function getPosition(uint256 id) view returns (tuple(uint256 tokenId, ${poolKey} key, int24 tickLower, int24 tickUpper, uint32 lastMove, ${settings}))`,
  v3Shaped: `function getPosition(uint256 id) view returns (tuple(uint256 tokenId, address pool, address token0, address token1, uint24 fee, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint32 lastMove, uint32 lastCompound, uint8 shape, ${shapedSettings}))`,
  v4Shaped: `function getPosition(uint256 id) view returns (tuple(uint256 tokenId, ${poolKey} key, int24 tickLower, int24 tickUpper, uint32 lastMove, uint32 lastCompound, uint8 shape, ${shapedSettings}))`,
}

// Number of Uniswap positions (bands) behind one shaped position; see Shapes.bands in the contracts.
function bands(shape) {
  shape = Number(shape)
  if ((shape & 3) === 0) return 1
  const n = shape >> 2
  return n === 0 ? 7 : n
}

async function vaults(api) {
  const out = []
  for (const factory of FACTORIES) {
    const logs = await getLogs({ api, target: factory, eventAbi: abis.vaultCreated, onlyArgs: true, fromBlock: FROM_BLOCK })
    logs.forEach(l => out.push({ vault: l.vault, v4: Number(l.kind) === KIND_V4, shaped: factory.toLowerCase() === SHAPED_FACTORY }))
  }
  return out
}

async function tvl(api) {
  const all = await vaults(api)
  const ids = await api.multiCall({ abi: abis.positionIds, calls: all.map(v => v.vault), permitFailure: true })

  const calls = { v3: [], v4: [], v3Shaped: [], v4Shaped: [] }
  all.forEach((v, i) => {
    const type = (v.v4 ? 'v4' : 'v3') + (v.shaped ? 'Shaped' : '')
    for (const id of ids[i] ?? []) calls[type].push({ target: v.vault, params: [id] })
  })
  const read = (type) => calls[type].length ? api.multiCall({ abi: abis[type], calls: calls[type] }) : []
  const [p3, p4, p3s, p4s] = await Promise.all([read('v3'), read('v4'), read('v3Shaped'), read('v4Shaped')])

  // Tokens waiting in the vaults (unplaced amounts, fees not yet reinvested).
  const tokensAndOwners = []
  p3.forEach((p, i) => tokensAndOwners.push([p.token0, calls.v3[i].target], [p.token1, calls.v3[i].target]))
  p3s.forEach((p, i) => tokensAndOwners.push([p.token0, calls.v3Shaped[i].target], [p.token1, calls.v3Shaped[i].target]))
  p4.forEach((p, i) => tokensAndOwners.push([p.key.currency0, calls.v4[i].target], [p.key.currency1, calls.v4[i].target]))
  p4s.forEach((p, i) => tokensAndOwners.push([p.key.currency0, calls.v4Shaped[i].target], [p.key.currency1, calls.v4Shaped[i].target]))

  // Uniswap v4 position ids: one per position, or tokenId .. tokenId + bands - 1 for a shaped one.
  const v4Ids = []
  p4.forEach(p => v4Ids.push(p.tokenId))
  p4s.forEach(p => { for (let i = 0; i < bands(p.shape); i++) v4Ids.push((BigInt(p.tokenId) + BigInt(i)).toString()) })

  const v3Owners = all.filter(v => !v.v4).map(v => v.vault)

  await sumTokens2({
    api,
    tokensAndOwners: tokensAndOwners.map(([t, o]) => [t === nullAddress ? nullAddress : t, o]),
    owners: v3Owners,
    resolveUniV3: v3Owners.length > 0,
  })
  if (v4Ids.length) await sumTokens2({ api, resolveUniV4: true, uniV4ExtraConfig: { positionIds: v4Ids } })
}

module.exports = {
  methodology: 'TVL is the liquidity in every Tidewell vault: the Uniswap v3 and v4 positions each vault holds (one per position, or one per band for shaped positions), valued at the current pool price, plus tokens waiting in the vaults to be reinvested. Staking is TIDE staked in The Well.',
  doublecounted: true, // the liquidity sits in Uniswap pools
  robinhood: {
    tvl,
    staking: staking(THE_WELL, TIDE),
  },
}
