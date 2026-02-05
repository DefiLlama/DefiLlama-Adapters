const { getTVL: tvl } = require('./queries.js')


module.exports = {
  ethereum: { tvl },
  polygon: { tvl },
  arbitrum: { tvl },
}
