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
// getDepegModule(i) reverts past the end, so read indexes in batches until one fails.
const GET_DEPEG_MODULE =
  'function getDepegModule(uint256 index) view returns (tuple(address dpAsset, address ybAsset, address depegPool))'
const BATCH = 20

async function getPools(api, factory) {
  const pools = []
  for (let start = 0; ; start += BATCH) {
    const res = await api.multiCall({
      target: factory,
      abi: GET_DEPEG_MODULE,
      calls: Array.from({ length: BATCH }, (_, i) => start + i),
      permitFailure: true,
    })
    for (const m of res) {
      if (!m) return pools
      pools.push(m.depegPool)
    }
  }
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
