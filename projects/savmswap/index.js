const { uniTvlExport } = require('../helper/unknownTokens')

const factories = {
    svm: '0x1842c9bD09bCba88b58776c7995A9A9bD220A925'
}

module.exports = {}
Object.entries(factories).forEach(([chain, factory]) =>
    module.exports = { ...module.exports, ...uniTvlExport(chain, factory) }
)
