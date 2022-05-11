const utils = require('../helper/utils')

function fetch(chain) {
  return async () => utils.fetchURL('https://api.beluga.fi/tvl').then(d => ({ 'usd-coin':  d.data[chain] }))
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
