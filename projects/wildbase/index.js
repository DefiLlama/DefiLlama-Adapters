const { getUniTVL } = require('../helper/unknownTokens')
const WILDx = "0xbCDa0bD6Cd83558DFb0EeC9153eD9C9cfa87782E";
const FACTORY = "0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E"


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses Uniswap-style factory address to find and price liquidity pairs.`,
    base: {
        tvl: getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, fetchBalances: true, }),
    }
};
