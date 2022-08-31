const { get } = require('../helper/http')
let _data

function fetch(chain) {
  return async () => {
    if (!_data) _data = get('https://api.beluga.fi/tvl')
    let data = await _data
    return {
      'usd-coin': data[chain]
    }
  }
}

module.exports = {
  timetravel: false,
  polygon: {
    tvl: fetch('Polygon')
  },
  fantom: {
    tvl: fetch('Fantom')
  },
}
