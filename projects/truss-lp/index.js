// TRUSS LP - automated concentrated-liquidity vaults (one vault contract per customer).
// TVL = what the customer vaults hold: idle tokens in each vault + the underlying of every LP position
// the vault owns (read from the vault's own positionIds()), across Base, OP Mainnet, Robinhood Chain and HyperEVM.
// Nothing outside the vaults (routers, libraries, fee or operator wallets) is counted.
const { addUniV3LikePosition } = require('../helper/unwrapLPs')
const { nullAddress } = require('../helper/tokenMapping')

// position layouts the vaults' position managers return
const POS = {
  // Slipstream / Uniswap-v3 / PancakeSwap-v3 shape: (nonce, operator, token0, token1, fee|tickSpacing, tickLower, tickUpper, liquidity, ...)
  slip: 'function positions(uint256) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 fg0, uint256 fg1, uint128 owed0, uint128 owed1)',
  // Ramses V3 shape: (token0, token1, tickSpacing, tickLower, tickUpper, liquidity, ...)
  ramses: 'function positions(uint256) view returns (address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 fg0, uint256 fg1, uint128 owed0, uint128 owed1)',
}

// every TRUSS vault factory: name, factory, how its positions are read
const CONFIG = {
  base: [
    { name: 'Aero (Base)', factory: '0xd505a36bD8e51E468e24e27bCE63d1a5BF775205', layout: 'slip' },
  ],
  optimism: [
    { name: 'Aero (OP Mainnet)', factory: '0xd6A23EAaC6FF894e327519AD91B2Fad638266f7B', layout: 'slip' },
  ],
  robinhood: [
    { name: 'UP33', factory: '0x7158B5D77cD54f78a536e3Ace28299fd5a7609a6', layout: 'slip' },
    { name: 'Raphael', factory: '0xdfB916FF892a2e9BC43f36e9a584f36c2E28eeb0', layout: 'slip' },
    { name: 'Aero (Robinhood)', factory: '0xc4bd16C4E762e1289fc468EeaEe4e7eA47775B98', layout: 'slip' },
    { name: 'Ramses (Robinhood)', factory: '0xFa179DE68D711360EcF9EAE2E4f9b1b78F5f34Aa', layout: 'ramses' },
    { name: 'GIGA', factory: '0x2Ff790D1d1A0cEAeCd340F60d601B0cA22757D35', layout: 'slip' },
    { name: 'Fables', factory: '0xa8afBD03602dc044C4Fd7b2231216AB3104A0f38', layout: 'fables' },
  ],
  hyperliquid: [
    { name: 'Ramses (HyperEVM)', factory: '0x6940112e98ca5D3CeB5a369e4b6744AD2554a84E', layout: 'ramses' },
    { name: 'Hybra', factory: '0x7B2a713082CeddB4ac7F05A33e13C1D38e1F2C6B', layout: 'slip' },
  ],
}

const abi = {
  vaultCount: 'uint256:vaultCount',
  allVaults: 'function allVaults(uint256) view returns (address)',
  lp: 'address:lp',
  rewardTokens: 'function rewardTokens() view returns (address[])',
  positionIds: 'function positionIds() view returns (uint256[])',
  slot0: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick)',
}

// Fables (Uniswap v4 hook): the vault's liquidity is an ERC-6909 balance on the pool's hook, one id per range;
// the vault maps its own position id to the hook's range id (rangeOf, 0 = closed)
const FABLES = {
  rangeOf: 'function rangeOf(uint256 id) view returns (uint256)',
  rangeKey: 'function rangeKey(uint256 id) view returns ((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key, int24 tickLower, int24 tickUpper, bool set)',
  balanceOf: 'function balanceOf(address owner, uint256 id) view returns (uint256)',
}

async function vaultsOf(api, factory) {
  const n = await api.call({ target: factory, abi: abi.vaultCount })
  if (!Number(n)) return []
  return api.multiCall({ target: factory, abi: abi.allVaults, calls: [...Array(Number(n)).keys()] })
}

function tvlFor(entries) {
  return async (api) => {
    for (const { factory, layout } of entries) {
      const vaults = await vaultsOf(api, factory)
      if (!vaults.length) continue

      const token0s = await api.multiCall({ abi: 'address:token0', calls: vaults })
      const token1s = await api.multiCall({ abi: 'address:token1', calls: vaults })
      const pools = await api.multiCall({ abi: 'address:pool', calls: vaults })     // Fables: the pool's FablesPoolView
      const nfpms = await api.multiCall({ abi: 'address:nfpm', calls: vaults })
      const hooks = await api.multiCall({ abi: 'address:gauge', calls: vaults })    // Fables: the pool's hook
      const idsList = await api.multiCall({ abi: abi.positionIds, calls: vaults })

      // reward tokens a vault may keep for its customer (claimed, not yet sold)
      const atomic = await api.call({ target: factory, abi: abi.lp })
      const rewards = await api.call({ target: atomic, abi: abi.rewardTokens })

      // 1) idle balances held by each vault
      const tokensAndOwners = []
      vaults.forEach((v, i) => {
        tokensAndOwners.push([token0s[i], v], [token1s[i], v], [nullAddress, v])   // + the vault's own ETH/HYPE
        rewards.forEach(r => tokensAndOwners.push([r, v]))
      })
      await api.sumTokens({ tokensAndOwners })

      // 2) LP positions owned by each vault
      const calls = []
      vaults.forEach((v, i) => (idsList[i] || []).forEach(id => calls.push({ i, id })))
      if (!calls.length) continue

      const ticks = await api.multiCall({ abi: abi.slot0, calls: pools })
      const positions = await readPositions(api, layout, calls, { vaults, hooks, nfpms })
      positions.forEach((p, k) => {
        if (!p) return
        const { i } = calls[k]
        const liquidity = Number(p.liquidity)
        if (!liquidity || !ticks[i]) return
        addUniV3LikePosition({
          api, token0: token0s[i], token1: token1s[i], liquidity,
          tickLower: Number(p.tickLower), tickUpper: Number(p.tickUpper), tick: Number(ticks[i].tick),
        })
      })
    }
  }
}

async function readPositions(api, layout, calls, { vaults, hooks, nfpms }) {
  if (layout === 'fables') {
    const rids = await api.multiCall({ abi: FABLES.rangeOf, calls: calls.map(({ i, id }) => ({ target: vaults[i], params: [id] })) })
    const open = calls.map((c, k) => ({ ...c, k, rid: rids[k] })).filter(c => String(c.rid) !== '0')
    const ranges = await api.multiCall({ abi: FABLES.rangeKey, calls: open.map(({ i, rid }) => ({ target: hooks[i], params: [rid] })) })
    const bals = await api.multiCall({ abi: FABLES.balanceOf, calls: open.map(({ i, rid }) => ({ target: hooks[i], params: [vaults[i], rid] })) })
    const positions = calls.map(() => null)
    open.forEach(({ k }, j) => {
      const r = ranges[j]
      if (r.set) positions[k] = { tickLower: r.tickLower, tickUpper: r.tickUpper, liquidity: bals[j] }
    })
    return positions
  }
  return api.multiCall({ abi: POS[layout], calls: calls.map(({ i, id }) => ({ target: nfpms[i], params: [id] })) })
}

module.exports = {
  methodology: 'TVL is the value of everything held by TRUSS LP customer vaults: idle tokens in each vault plus the underlying tokens of every concentrated-liquidity position the vault owns (Aerodrome, UP33, Raphael, Ramses, GIGA, Fables and Hybra pools).',
  doublecounted: true,
  start: '2026-10-22',
}

Object.keys(CONFIG).forEach(chain => {
  module.exports[chain] = { tvl: tvlFor(CONFIG[chain]) }
})
