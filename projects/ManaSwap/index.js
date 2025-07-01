const { uniTvlExport } = require('../helper/unknownTokens')
const chain = 'hyperliquid'
const factory = '0x46BC787Bf21D9178f2dEbAD939e76c7E9Dd0A392' // v2 factory address

module.exports = uniTvlExport(chain, factory)