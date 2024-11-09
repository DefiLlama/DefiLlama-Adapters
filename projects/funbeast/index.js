const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    methodology: "Astar Exchange Tvl Calculation",
    astar: {
        tvl: getUniTVL({ factory: '0xb99978440F310658C5E69D5042724327EF6D3CE7', useDefaultCoreAssets: true }),
    }
};
