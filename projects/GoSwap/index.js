const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
        misrepresentedTokens: true,
    methodology: "Factory address (0xe93c2cD333902d8dd65bF9420B68fC7B1be94bB3) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    gochain: {
        tvl: getUniTVL({ factory: '0xe93c2cD333902d8dd65bF9420B68fC7B1be94bB3', useDefaultCoreAssets: true }),
    }
}