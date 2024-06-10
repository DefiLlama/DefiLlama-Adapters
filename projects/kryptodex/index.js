const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require('../helper/staking')
module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory address (0x33c04bD4Ae93336BbD1024D709f4A313cC858EBe) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    cronos: {
        tvl: getUniTVL({ factory: '0x33c04bD4Ae93336BbD1024D709f4A313cC858EBe', useDefaultCoreAssets: true }),
        staking: stakingPricedLP("0x53cE820Ed109D67746a86b55713E30252275c127", "0xF0681BB7088Ac68A62909929554Aa22ad89a21fB", "cronos", "0xD2219106310E46D7FD308c0eC9d9FCc2d2c8a9B5", "crypto-com-chain")
    }
}