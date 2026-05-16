const { getExports } = require('../helper/heroku-api')
const indexExports = require('./index')
const chainKeys = Object.keys(indexExports).filter(chain => typeof indexExports[chain] === 'object' && indexExports[chain].tvl)

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ...getExports("team-finance", chainKeys),
  // hallmarks: [
  //   ['2022-10-27',"$14.5m Exploit"]
  // ],
  //https://etherscan.io/tx/0xb2e3ea72d353da43a2ac9a8f1670fd16463ab370e563b9b5b26119b2601277ce 
  //https://twitter.com/TeamFinance_/status/1585562380591063043
}
