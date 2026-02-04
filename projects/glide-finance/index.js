const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPriceLP } = require('../helper/staking')

module.exports={
        misrepresentedTokens: true,
    methodology: "Factory address (0xaAbe38153b25f0d4b2bDa620f67059B3a45334e5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    elastos: {
        tvl: getUniTVL({ factory: '0xaAbe38153b25f0d4b2bDa620f67059B3a45334e5', useDefaultCoreAssets: true }),
        staking: stakingPriceLP("0x7F5489f77Bb8515DE4e0582B60Eb63A7D9959821", "0xd39eC832FF1CaaFAb2729c76dDeac967ABcA8F27", "0xbeeAAb15628329C2C89Bc9F403d34b31fbCb3085", "elastos")
    }
}
