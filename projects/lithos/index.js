const { uniTvlExport } = require('../helper/unknownTokens')
const chain = 'plasma'
const factory = '0x71a870D1c935C2146b87644DF3B5316e8756aE18...' // v2 factory address

module.exports = uniTvlExport(chain, factory)