const { getLiquityTvl } = require("../helper/liquity.js")
const { staking } = require("../helper/staking.js")

module.exports = {
  pulse: {
    tvl: getLiquityTvl('0xD79bfb86fA06e8782b401bC0197d92563602D2Ab'),
    staking: staking('0x853F0CD4B0083eDf7cFf5Ad9A296f02Ffb71C995', '0x9159f1D2a9f51998Fc9Ab03fbd8f265ab14A1b3B')
  }
}