const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')
const PLANT = "0x23082Dd85355b51BAe42248C961E7F83486e7694";
const FACTORY = "0xA081Ce40F079A381b59893b4Dc0abf8B1817af70"


const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(${FACTORY}) address and whitelisted tokens address to find and price Liquidity Pool pairs.`,
    base: {
        tvl: dexTVL,
        staking: sumTokensExport({
            owners: ['0xECBb9E8fc8CAa4f01C7A44d4c8947143a470C352'],
            tokens: [PLANT],
        })
    }
};