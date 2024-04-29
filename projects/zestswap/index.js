const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0xda36B416102E0C9Ff562bA2daa7836242caeD9EF) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    xlayer: {
        tvl: getUniTVL({ factory: '0xda36B416102E0C9Ff562bA2daa7836242caeD9EF', chain: 'xlayer', useDefaultCoreAssets: true }),
    }
}