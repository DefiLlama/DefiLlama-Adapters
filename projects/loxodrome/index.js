const { uniTvlExport } = require('../helper/unknownTokens')
const { mergeExports } = require('../helper/utils')

const exports1 = uniTvlExport('iotex', '0x92bfa051bf12a0aef9a5e1ac8b2aa7dc1b05a406', { hasStablePools: true, })
const exports2 = uniTvlExport('iotex', '0x9442E8d017bb3dC2Ba35d75204211e60f86fF0F8', { hasStablePools: true, })

module.exports = mergeExports(exports1, exports2)