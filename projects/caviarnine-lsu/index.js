const { get } = require('../helper/http')

async function tvl(_, _b, _cb, { api, }) {
  const { summary } = await get('https://api-core.caviarnine.com/v1.0/stats/product/lsupool')
  return {
    'radix': summary.total_value_locked.xrd
  }
}

module.exports = {
  timetravel: false,
  radixdlt: { tvl }
}