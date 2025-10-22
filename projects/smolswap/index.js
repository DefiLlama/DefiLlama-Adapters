const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require('../helper/staking')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x7Aa2149fF9EF4A09D4ace72C49C26AaE8C89Fb48) is used to find the LP pairs. TVL is equal to the liquidity on the AMM, while staking is the amount of SMOL tokens found in the Masterchef(0x66a5f06d9c8bdc27bb0768eeff71d22b468fb464).",
    cronos: {
        tvl: getUniTVL({ factory: '0x7Aa2149fF9EF4A09D4ace72C49C26AaE8C89Fb48', useDefaultCoreAssets: true }),
        staking: stakingPricedLP(
            "0x66a5f06d9c8bdc27bb0768eeff71d22b468fb464", 
            "0x2Ad63Da83d6ff5dA9E716DcaE844D4f157405BDd", 
            "cronos", 
            "0x408b982fDC78eA8fdF8f8652C7893181A645d782", 
            "crypto-com-chain",
            true
        )
    }
}