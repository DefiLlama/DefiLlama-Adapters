const { getExports } = require('../helper/heroku-api')
const indexExports = require('./index')
const chainKeys = Object.keys(indexExports).filter(chain => typeof indexExports[chain] === 'object' && indexExports[chain].tvl)

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  ...getExports("unicrypt", chainKeys),
}

module.exports.bsc.pool2 = indexExports.bsc.pool2
module.exports.ethereum.pool2 = indexExports.ethereum.pool2
module.exports.ethereum.staking = indexExports.ethereum.staking
module.exports.xdai.pool2 = indexExports.xdai.pool2
