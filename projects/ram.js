const { compoundExports2 } = require("./helper/compound");

module.exports = {
  thundercore: compoundExports2({ comptroller: '0x0d4fe8832857Bb557d8CFCf3737cbFc8aE784106', cether: '0xef5a0ce54a519b1db3f350eb902c4cfbf7671d88' })
}
module.exports.thundercore.borrowed = ()  => ({})
module.exports.deadFrom = '2023-03-05' 