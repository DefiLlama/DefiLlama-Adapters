const { uniTvlExport } = require('../helper/unknownTokens')
const chain = 'bahamut'
const factory = '0xF660558a4757Fb5953d269FF32E228Ae3d5f6c68' // v2 factory address

module.exports = uniTvlExport(chain, factory)