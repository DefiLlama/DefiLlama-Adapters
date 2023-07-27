const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    neon_evm: {
        tvl: getUniTVL({ factory: '0xd43F135f6667174f695ecB7DD2B5f953d161e4d1', useDefaultCoreAssets: true }),
    }
};


