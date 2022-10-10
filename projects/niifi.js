const { getUniTVL } = require('./helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    nahmii: {
        tvl: getUniTVL({ factory: '0xe3DcF89D0c90A877cD82283EdFA7C3Bd03e77E86', chain: 'nahmii', useDefaultCoreAssets: true }),
    }
}; // node test.js projects/niifi.js