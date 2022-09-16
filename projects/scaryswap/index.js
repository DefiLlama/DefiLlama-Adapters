const { getUniTVL} = require('../helper/unknownTokens')

const chain = 'fantom'

module.exports = {
    fantom: {
        tvl: getUniTVL({
            chain,
            useDefaultCoreAssets: true,
            factory: '0x7ceb5f3a6d1888eec74a41a5377afba5b97200ea',
        }),
    },
}
