const { uniTvlExport } = require('../helper/unknownTokens')
const chain = 'mantle'
const factory = '0x5B54d3610ec3f7FB1d5B42Ccf4DF0fB4e136f249' // v2 factory address

module.exports = uniTvlExport(chain, factory)
