const { queryAddresses } = require('../helper/chain/radixdlt')

module.exports = {
  radixdlt: { tvl },
}

async function tvl(api) {
  const [{ details: { state }, fungible_resources }] = await queryAddresses({ addresses: ['component_rdx1crezrpxw9ypg6v2panqjqwevnwplg94yeej0rhqq9k7p4kgnltrc9g'], miscQuery: { "aggregation_level": "Vault" } })
  const stateObj = {}
  state.fields.map(i => stateObj[i.field_name] = +i.value)
  const poolAmount = parseFloat(fungible_resources.items[0].vaults.items[0].amount)
  const tvl_usd = poolAmount + stateObj.virtual_balance + stateObj.unrealized_pool_funding + stateObj.pnl_snap
  api.add('resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf', tvl_usd)
}
