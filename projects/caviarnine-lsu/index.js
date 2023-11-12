const { get } = require('../helper/http')

async function tvl(_, _b, _cb, { api, }) {
  const { composition } = await get('https://api-core.caviarnine.com/v1.0/lsupool/get_details')
  return {
    'radix': composition.reduce((acc, i) => acc + i.amount_in_lsu/1e18 * +i.price_lsu_to_xrd, 0)
  }
}

module.exports = {
  timetravel: false,
  radixdlt: { tvl }
}