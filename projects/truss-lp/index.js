// TRUSS LP - automated concentrated-liquidity vaults on Aerodrome Slipstream (Base)
// TVL = idle token0/token1 held by every vault + every Slipstream position the
// AerodromeAtomicV3 contract has staked in a gauge on the vaults' behalf.
const { sumTokens2, addUniV3LikePosition } = require('../helper/unwrapLPs')

const FACTORY = '0x65Ab206bc394a2DA6bd687Ba99ABad1Bd6f2dB2f' // LPVaultFactoryV3
const ATOMIC = '0x57Ab7cADE09605149d5a00Cd6Fa71588C164122b'  // AerodromeAtomicV3 (stakes positions for vaults)
const VOTER = '0x16613524e02ad97eDfeF371bC883F2F5d6C480A5'   // Aerodrome Voter

const abi = {
  vaultCount: 'uint256:vaultCount',
  allVaults: 'function allVaults(uint256) view returns (address)',
  gauges: 'function gauges(address) view returns (address)',
  stakedValues: 'function stakedValues(address depositor) view returns (uint256[])',
  positions: 'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, int24 tickSpacing, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
  slot0: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, bool unlocked)',
}

async function tvl(api) {
  const n = await api.call({ target: FACTORY, abi: abi.vaultCount })
  const vaults = await api.multiCall({ target: FACTORY, abi: abi.allVaults, calls: [...Array(Number(n)).keys()] })
  if (!vaults.length) return

  const pools = await api.multiCall({ abi: 'address:pool', calls: vaults })
  const token0s = await api.multiCall({ abi: 'address:token0', calls: vaults })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: vaults })

  // 1) idle tokens sitting in each vault
  const tokensAndOwners = []
  vaults.forEach((v, i) => { tokensAndOwners.push([token0s[i], v], [token1s[i], v]) })
  await sumTokens2({ api, tokensAndOwners })

  // 2) staked Slipstream positions (held by the atomic in each pool's gauge)
  const uniqPools = [...new Set(pools.map(p => p.toLowerCase()))]
  const gauges = await api.multiCall({ target: VOTER, abi: abi.gauges, calls: uniqPools })
  const live = uniqPools.map((p, i) => ({ pool: p, gauge: gauges[i] }))
    .filter(x => x.gauge && x.gauge !== '0x0000000000000000000000000000000000000000')
  if (!live.length) return

  const nfpms = await api.multiCall({ abi: 'address:nft', calls: live.map(x => x.gauge) })
  const staked = await api.multiCall({ abi: abi.stakedValues, calls: live.map(x => ({ target: x.gauge, params: [ATOMIC] })) })
  const slot0s = await api.multiCall({ abi: abi.slot0, calls: live.map(x => x.pool) })

  for (let i = 0; i < live.length; i++) {
    const ids = staked[i] || []
    if (!ids.length) continue
    const pos = await api.multiCall({ target: nfpms[i], abi: abi.positions, calls: ids })
    const tick = Number(slot0s[i].tick)
    pos.forEach(p => {
      if (Number(p.liquidity) === 0) return
      addUniV3LikePosition({
        api, token0: p.token0, token1: p.token1, liquidity: Number(p.liquidity),
        tickLower: Number(p.tickLower), tickUpper: Number(p.tickUpper), tick,
      })
    })
  }
}

module.exports = {
  methodology: 'TVL is the value of all tokens held by TRUSS LP vaults: idle token balances in each vault plus the underlying tokens of every Aerodrome Slipstream position staked in a gauge on the vaults\' behalf.',
  start: '2026-09-25',
  base: { tvl },
}
