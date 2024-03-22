const { get } = require('../helper/http')

async function tvl(api) {

  const endpoint = 'https://api.ociswap.com/statistics';
  const options = {
    headers: {
      'accept': 'application/json'
    }
  };

  const statistics = await get(endpoint, options)

  return {
    'radix': statistics.total_value_locked.xrd.now
  }
}

module.exports = {
  timetravel: false,
  radixdlt: { tvl }
}
