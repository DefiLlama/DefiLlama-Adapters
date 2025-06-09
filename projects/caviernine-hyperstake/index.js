const { sumTokens, queryAddresses, transformLSUs } = require('../helper/chain/radixdlt')

async function tvl(api) {
  const res = await queryAddresses({ addresses: ['component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf'] })
  await sumTokens({ api, owners: res.map(i => i.metadata.items.find(i => i.key === 'pool_component').value.typed.value), })

  return transformLSUs(api)
}

module.exports = {
  timetravel: false,
  radixdlt: { tvl }
}