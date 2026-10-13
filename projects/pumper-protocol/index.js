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
const USDT0 = '0x779Ded0c9e1022225f8E0630b35a9b54bE713736'
const WGUSDT = '0x817997Ca8394E26CCE3dE3A076a4889b27DbF9dE'
const QUOTE_TOKENS = [USDT0, WGUSDT]
const NATIVE = '0x0000000000000000000000000000000000000000'

// Report every stablecoin as USDT0. On Stable, USDT0 held by a contract is read
// as the native gas balance (18dp, same money as the 6dp ERC-20 view), and
// WgUSDT is an 18dp 1:1 wrapper of USDT0.
function toUsdt0(api) {
  const balances = api.getBalances()
  let extra = 0
  // the same token can appear under differently-cased keys (checksummed vs lowercase)
  const keys = [NATIVE, WGUSDT].map((t) => `stable:${t.toLowerCase()}`)
  for (const key of Object.keys(balances).filter((k) => keys.includes(k.toLowerCase()))) {
    extra += Number(balances[key]) / 1e12
  }
  for (const token of [NATIVE, WGUSDT]) api.removeTokenBalance(token)
  if (extra) api.add(USDT0, extra)
}

// PUMPER LP NFTs parked to fund staker rewards
const PUMPER_LP_GAUGES = [
  '0x19f2A134F39dF26370E09B36A7817D23Eec6fE6A', // PumperLpGaugeV3
  '0x859f6F2Fe604B2d132a969EdA2b406a0293801d3', // PumperGoldGauge
  '0xBb8778DF4F4b6ec8D047F887E22fC42bB815E173', // PumperLpGauge (legacy)
]
// PumperRewardLocker: staked PUMPER
const PUMPER_STAKING = [
  '0x1276021Cf10aD7b3f9677Ee5A70827146Cc1b5CF', // WgUSDT reward pool (legacy)
  '0x9CA420D62cb4Aa52c2E86096aa3b0bD072a1334B', // USDT0 reward pool
]

async function getLaunches(api) {
  // allTokens has no length getter: read it in pages until an index fails
  const tokens = []
  for (let page = 0; ; page += 100) {
    const batch = await api.multiCall({
      abi: 'function allTokens(uint256) view returns (address)',
      target: REGISTRY,
      calls: Array.from({ length: 100 }, (_, i) => page + i),
      permitFailure: true,
    })
    const found = batch.filter(Boolean)
    tokens.push(...found)
    if (found.length < batch.length) break
  }
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
  const vaults = await api.multiCall({
    abi: 'function vaultOf(address) view returns (address)',
    calls: v4Launches.map((l) => ({ target: l.launchpad, params: [l.token] })),
    permitFailure: true,
  })
  const escrows = [V4_POOL_MANAGER, ...v4Launchpads, ...vaults.filter((v) => v && !/^0x0+$/.test(v))]
  await sumTokens2({
    api,
    owners: [...v3Launchpads, ...escrows],
    tokens: QUOTE_TOKENS,
    resolveUniV3: true,
    uniV3WhitelistedTokens: QUOTE_TOKENS,
  })
  toUsdt0(api)
}

async function pool2(api) {
  await sumTokens2({ api, owners: PUMPER_LP_GAUGES, resolveUniV3: true })
  toUsdt0(api)
}

async function staking(api) {
  return sumTokens2({ api, owners: PUMPER_STAKING, tokens: [PUMPER] })
}

module.exports = {
  doublecounted: true, // V3 launch liquidity is also stableswap DEX TVL
  methodology: 'TVL is the USDT0 side of the liquidity of every token launched on Pumper Launchpad (WgUSDT counted as USDT0, 1:1): the Uniswap V3 LP positions held by the V3 launchpads, the liquidity in Pumper\'s Uniswap V4 PoolManager used by the V4 and Lock launchpads, and curve raises escrowed by the Lock launchpads before migration. Launches are taken from PumperProtocolRegistry. Pool2 is the PUMPER/USDT0 LP parked in the Pumper Staking Pool gauge. Staking is PUMPER staked in the Pumper Staking Pool (PUMPER reward lockers). Launched tokens\' own Pumper Launchpad staking pools are not counted, since launched tokens have no price.',
  stable: { tvl, pool2, staking },
}
