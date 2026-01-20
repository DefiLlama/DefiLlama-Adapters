const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'hedera': '0x0000000000000000000000000000000000134224'
})

module.exports.hallmarks = [
  ['2023-10-30', 'Protocol is sunset'],
]

console.log(module.exports)