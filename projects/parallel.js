const { getExports } = require('./helper/heroku-api')

module.exports = {
  // deadFrom: '2024-08-17',
  timetravel: false,
  ...getExports("parallel-crowdloan", ['heiko', 'parallel']),
}

const chains = ['heiko', 'parallel']
chains.forEach(chain => {
  Object.keys(module.exports[chain]).forEach(key => module.exports[chain][key] =  () => ({}))  
})