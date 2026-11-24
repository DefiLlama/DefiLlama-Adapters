// Tapir Protocol: depeg-protection marketplace for yield-bearing tokens.
// Each DepegPool holds one base asset as collateral and mints two tranche
// tokens against it: DP (Depeg Protected) and YB (Yield Boosted).
//
// TVL = base asset held by every DepegPool created by the DepegFactory.
// DP / YB tokens and the DP/YB AMM liquidity are claims on that same
// collateral, so they are NOT counted (would double count).
//
// The live base asset is zvUSDC, an ERC-4626 vault share of Zircuit Finance
// (underlying zUSDC). Held tokens are reported as is; pricing is left to the
// coins service. Because the collateral sits inside Zircuit Finance, the
// protocol is flagged doublecounted.

const config = {
  base: { factory: '0xc0C409aEdCE4fE91Fa26971EdF23E7d97C81d1c5' }, // DepegFactory v1.1
}

// The factory stores pools in a private array with no length getter;
// getDepegModule(i) reverts with Panic(0x32) past the end. Indexes are read in
// batches through Multicall3 tryAggregate, which returns each call's revert data:
// only the out-of-bounds panic ends the list. Any other revert, or a failed RPC
// call, fails the run instead of returning a partial pool list.
const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11'
const TRY_AGGREGATE =
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] returnData)'
const GET_DEPEG_MODULE = '0xd09081b7' // getDepegModule(uint256) -> (address dpAsset, address ybAsset, address depegPool)
const PANIC_OUT_OF_BOUNDS = '0x4e487b71' + '32'.padStart(64, '0') // Panic(uint256) with code 0x32
const BATCH = 20
const MAX_POOLS = 1000

async function getPools(api, factory) {
  const pools = []
  for (let start = 0; start < MAX_POOLS; start += BATCH) {
    const calls = Array.from({ length: BATCH }, (_, i) => [
      factory,
      GET_DEPEG_MODULE + (start + i).toString(16).padStart(64, '0'),
    ])
    const res = await api.call({ target: MULTICALL3, abi: TRY_AGGREGATE, params: [false, calls] })
    for (let i = 0; i < res.length; i++) {
      const { success, returnData } = res[i]
      if (!success) {
        if (returnData.toLowerCase() === PANIC_OUT_OF_BOUNDS) return pools
        throw new Error(`tapir: getDepegModule(${start + i}) reverted: ${returnData}`)
      }
      if (start + i === 0 && returnData === '0x') return pools // factory not deployed yet at this block
      if (returnData.length !== 2 + 3 * 64) throw new Error(`tapir: getDepegModule(${start + i}) returned ${returnData}`)
      pools.push('0x' + returnData.slice(-40)) // depegPool is the last 32-byte word
    }
  }
  throw new Error(`tapir: more than ${MAX_POOLS} pools, raise MAX_POOLS`)
}

async function tvl(api) {
  const pools = await getPools(api, config[api.chain].factory)
  if (!pools.length) return

  const assets = await api.multiCall({ abi: 'address:ASSET', calls: pools })
  return api.sumTokens({ tokensAndOwners2: [assets, pools] })
}

module.exports = {
  doublecounted: true,
  methodology:
    'TVL is the collateral held in Tapir DepegPools. Live collateral is Zircuit Finance zvUSDC (ERC-4626 vault shares on zUSDC), reported as held. DP and YB tranche tokens and their AMM liquidity are claims on the same collateral and are not counted.',
  start: '2026-08-03',
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})
