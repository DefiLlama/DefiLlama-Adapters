const { sumTokens, transformLSUs } = require('../helper/chain/radixdlt')
const ADDRESSES = require('../helper/coreAssets.json')

// LSU Pool component from CaviarNine docs (was read via api-core.caviarnine.com, dead since Sep 2026)
const LSU_POOL = 'component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp'

async function tvl(api) {
  await sumTokens({ api, owners: [LSU_POOL] })
  const balances = await transformLSUs(api)
  // queryLiquidStakeUnitDetails swallows lookup errors (returns {}): fail loud
  // instead of reporting unconverted LSU units (converted XRD itself excluded)
  const leftover = Object.keys(balances).filter(k => k.startsWith('radixdlt:resource_') && !k.endsWith(ADDRESSES.radixdlt.XRD))
  if (leftover.length) throw new Error(`LSU redemption lookup failed for ${leftover.length} resources`)
  return balances
}

module.exports = {
  timetravel: false,
  radixdlt: { tvl }
}
