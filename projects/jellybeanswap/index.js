const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
    methodology: `Uses factory(0x320827adb3f759a386348b325c54803b2b3a7572) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    misrepresentedTokens: true,
    doublecounted: false,
    timetravel: true,
    incentivized: true,
    bsc: {
        tvl: getUniTVL({ factory: '0x320827adb3f759a386348b325c54803b2b3a7572', chain: 'bsc', useDefaultCoreAssets: true }),
    }
};
