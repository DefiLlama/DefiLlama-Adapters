const { uniTvlExport } = require('../helper/unknownTokens')
const chain = 'tara'
const factory = '0x4a0Ff253BcE0CB539faC23517FFD968308220C5B' // v2 factory address

module.exports = uniTvlExport(chain, factory)