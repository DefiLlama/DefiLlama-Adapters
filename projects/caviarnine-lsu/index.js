const { sumTokens, transformLSUs } = require('../helper/chain/radixdlt')

// LSU Pool component from CaviarNine docs (was read via api-core.caviarnine.com, dead since Sep 2026)
const LSU_POOL = 'component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp'

async function tvl(api) {
  await sumTokens({ api, owners: [LSU_POOL] })
  return transformLSUs(api)
}

module.exports = {
  timetravel: false,
  radixdlt: { tvl }
}
