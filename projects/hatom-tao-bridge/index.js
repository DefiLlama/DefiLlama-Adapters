const { getExports } = require('../helper/heroku-api')

module.exports = {
  methodology: 'Value of tao locked in the bridge contract',
  ...getExports("hatom-tao-bridge", ['bittensor']),
}