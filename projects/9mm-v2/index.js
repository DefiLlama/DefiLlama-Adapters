const { getUniTVL } = require('../helper/unknownTokens')

// The getUniTVL function is used to calculate the total value locked (TVL) in Uniswap-like decentralized exchanges.
module.exports = {
    // The misrepresentedTokens property indicates that the tokens in the TVL calculation may be misrepresented.
    misrepresentedTokens: true,
    // The methodology property explains how the TVL is calculated.
    methodology: "Factory addresses (0x3a0Fa7884dD93f3cd234bBE2A0958Ef04b05E13b for PulseChain) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    pulse: {
        tvl: getUniTVL({
            factory: '0x3a0Fa7884dD93f3cd234bBE2A0958Ef04b05E13b',
            useDefaultCoreAssets: true,
        }),
    },
}
