const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0xEe4fa96b695De795071d40EEad0e8Fd42cdB9951) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    cronos: {
        tvl: getUniTVL({ factory: '0xEe4fa96b695De795071d40EEad0e8Fd42cdB9951', useDefaultCoreAssets: true }),
    }
}