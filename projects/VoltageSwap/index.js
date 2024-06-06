const { uniTvlExport } = require('../helper/unknownTokens')
const chain = 'scroll'
const factory = '0x7328d0dcbCcDA2F5bBA6Ce866cC9478cc8c0F938' // v2 factory address

module.exports = uniTvlExport(chain, factory)