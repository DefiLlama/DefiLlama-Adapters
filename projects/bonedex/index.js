const { uniTvlExport } = require('../helper/unknownTokens')

module.exports = uniTvlExport(
    'Shibarium',
    '0x907599886DeBF90CCB1e9B446b31D52bDD25926D',
    { fetchBalances: true,}
)
