
const { get } = require('../helper/http')

async function tvl(api) {
  const { tvl } = await get('https://api.radlock.io/tvl/rlyfun')
  return {
    'radix': tvl
  }
}

module.exports = {
  timetravel: false,
  radixdlt: { tvl }
}
