const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory addresses (0x3a0Fa7884dD93f3cd234bBE2A0958Ef04b05E13b for PulseChain) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    pulse: {
        tvl: getUniTVL({
            factory: '0x3a0Fa7884dD93f3cd234bBE2A0958Ef04b05E13b',
            useDefaultCoreAssets: true,
        }),
    },
}