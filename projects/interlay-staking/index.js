const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  interlay:{
    staking: getExports('interlay-staking', ['interlay']).interlay.tvl,
    tvl: ()=>({}),
  }
}
