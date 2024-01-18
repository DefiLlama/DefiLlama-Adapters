const { getLiquityTvl } = require("../helper/liquity.js")

module.exports = {
  pulse: {
    tvl: getLiquityTvl('0xD79bfb86fA06e8782b401bC0197d92563602D2Ab'),
  }
}