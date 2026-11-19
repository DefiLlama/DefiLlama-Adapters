const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Pumper Protocol (pumper.tools) on Stable.
//
// Every launchpad generation registers its launches in PumperProtocolRegistry,
// so the registry's allTokens list is the exact set of Pumper launches.
//  - V3 launchpads hold their tokens' Uniswap V3 LP NFTs (stableswap position
//    manager) themselves. That liquidity is also counted as stableswap DEX
//    TVL, hence doublecounted.
//  - V4 and Lock launchpads register Pumper's own Uniswap V4 PoolManager
//    instead of a pool; the PoolManager holds those launches' liquidity. Lock
//    launchpads also escrow curve raises before migration, in the launchpad
//    itself (v2) or in a per-launch vault (v3+).
// Only the stablecoin side (USDT0 / WgUSDT) is counted; launched tokens are
// not priced.

const REGISTRY = '0x7Cd190e5Ba34C1Ec8FE07F78EddB026719940492'
const V4_POOL_MANAGER = '0x3F95674d4C0c2FB1525DA536e0A57f4A86902665'

const PUMPER = '0xd86800D5b021F5D79350C2F742Bbb1ecc010Bf82'
const USDT0 = ADDRESSES.xlayer.USDT0
const WGUSDT = '0x817997Ca8394E26CCE3dE3A076a4889b27DbF9dE'
const QUOTE_TOKENS = [USDT0, WGUSDT]
// PumperRewardLocker: staked PUMPER
const PUMPER_STAKING = [
  '0x1276021Cf10aD7b3f9677Ee5A70827146Cc1b5CF', // WgUSDT reward pool (legacy)
  '0x9CA420D62cb4Aa52c2E86096aa3b0bD072a1334B', // USDT0 reward pool
]

async function getLaunches(api) {
  const tokens = await api.fetchList({ lengthAbi: 'totalTokens', itemAbi: 'allTokens', target: REGISTRY })
  const records = await api.multiCall({
    abi: 'function tokens(address) view returns (address creator, address pool, address launchpad)',
    target: REGISTRY,
    calls: tokens,
  })
  const launches = records.map((r, i) => ({ token: tokens[i], pool: r.pool, launchpad: r.launchpad }))
  const isV4 = (l) => l.pool.toLowerCase() === V4_POOL_MANAGER.toLowerCase()
  return {
    v3Launchpads: [...new Set(launches.filter((l) => !isV4(l)).map((l) => l.launchpad))],
    v4Launches: launches.filter(isV4),
  }
}

async function tvl(api) {
  const { v3Launchpads, v4Launches } = await getLaunches(api)
  const v4Launchpads = [...new Set(v4Launches.map((l) => l.launchpad))]
  // vaultOf exists only on the Lock launchpads that escrow in a per-launch vault
  const vaults = await api.multiCall({
    abi: 'function vaultOf(address) view returns (address)',
    calls: v4Launches.map((l) => ({ target: l.launchpad, params: [l.token] })),
    permitFailure: true,
  })
  const escrows = [V4_POOL_MANAGER, ...v4Launchpads, ...vaults.filter((v) => v && !/^0x0+$/.test(v))]
  return sumTokens2({
    api,
    owners: [...v3Launchpads, ...escrows],
    tokens: QUOTE_TOKENS,
    resolveUniV3: true,
    uniV3WhitelistedTokens: QUOTE_TOKENS,
  })
}

async function staking(api) {
  return sumTokens2({ api, owners: PUMPER_STAKING, tokens: [PUMPER] })
}

module.exports = {
  doublecounted: true, // V3 launch liquidity is also stableswap DEX TVL
  methodology: 'TVL is the USDT0/WgUSDT side of the liquidity of every token launched on Pumper Launchpad: the Uniswap V3 LP positions held by the V3 launchpads, the liquidity in Pumper\'s Uniswap V4 PoolManager used by the V4 and Lock launchpads, and curve raises escrowed by the Lock launchpads before migration. Launches are taken from PumperProtocolRegistry. Staking is PUMPER staked in the Pumper Staking Pool (PUMPER reward lockers). Launched tokens\' own Pumper Launchpad staking pools are not counted, since launched tokens have no price.',
  stable: { tvl, staking },
}
