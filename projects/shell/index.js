const {tokenHolderBalances} = require('../helper/tokenholders')

module.exports={
    tvl: tokenHolderBalances([
        {
            tokens: [
                '0xdac17f958d2ee523a2206206994597c13d831ec7',  // USDT
                '0x6B175474E89094C44Da98b954EedeAC495271d0F',  // DAI
                '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',  // USDC
                '0x57ab1ec28d129707052df4df418d58a2d46d5f51',  // sUSD
                '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',  // WBTC
                '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',  // renBTC
                '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6'   // sBTC
            ],
            holders: [
                '0x8f26D7bAB7a73309141A291525C965EcdEa7Bf42',
                '0xC2D019b901f8D4fdb2B9a65b5d226Ad88c66EE8D',
                // old
                '0x2E703D658f8dd21709a7B458967aB4081F8D3d05',
                '0x02Af7C867d6Ddd2c87dEcec2E4AFF809ee118FBb',
            ],
        },
    ])
}