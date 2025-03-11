const { get } = require('../helper/http')
const { sumTokens, queryAddresses, transformLSUs } = require('../helper/chain/radixdlt')

async function tvl(api) {
  const { summary } = await get('https://api-core.caviarnine.com/v1.0/stats/product/simplepools')
  const res = await queryAddresses({ addresses: summary.components })
  await sumTokens({ api, owners: res.map(i => i.metadata.items.find(i => i.key === 'pool_component').value.typed.value),})

  return transformLSUs(api)
}

module.exports = {
  timetravel: false,
  radixdlt: { tvl }
}