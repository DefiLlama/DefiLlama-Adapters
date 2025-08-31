const { sumTokens, queryAddresses, transformLSUs } = require('../helper/chain/radixdlt')
const { getConfig } = require('../helper/cache')

async function tvl(api) {
  const { summary } = await getConfig('caviarnine/simple-pools', 'https://api-core.caviarnine.com/v1.0/stats/product/simplepools')
  const res = await queryAddresses({ addresses: summary.components.filter(
    i => i !== 'component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf'  // this is hyperstake pool component, tracked under a new listing
  ) })
  await sumTokens({ api, owners: res.map(i => i.metadata.items.find(i => i.key === 'pool_component').value.typed.value),})

  return transformLSUs(api)
}

module.exports = {
  timetravel: false,
  radixdlt: { tvl }
}