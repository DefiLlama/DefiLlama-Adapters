const { getUniTVL } = require('./helper/unknownTokens')
module.exports = {
    methodology: `Uses factory(0x34696b6cE48051048f07f4cAfa39e3381242c3eD) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    misrepresentedTokens: true,
    aurora: {
        tvl: getUniTVL({
            factory: "0x34696b6cE48051048f07f4cAfa39e3381242c3eD",
            useDefaultCoreAssets: true,
        })
    }
}; // node test.js projects/amaterasu.js