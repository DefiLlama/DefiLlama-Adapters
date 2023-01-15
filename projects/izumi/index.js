const { staking } = require('../helper/staking')
const { getExports } = require('../helper/heroku-api')
const indexExports = require('./api')
const chainKeys = Object.keys(indexExports).filter(chain => typeof indexExports[chain] === 'object' && indexExports[chain].tvl)

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  ...getExports("izumi", chainKeys, ['pool2']),
}

module.exports.ethereum.staking = staking('0xb56a454d8dac2ad4cb82337887717a2a427fcd00', '0x9ad37205d608b8b219e6a2573f922094cec5c200')

