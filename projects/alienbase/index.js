const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')
const ALB = "0x1dd2d631c92b1aCdFCDd51A0F7145A50130050C4";
const FACTORY = "0x3E84D913803b02A4a7f027165E8cA42C14C0FdE7"


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses Uniswap-style factory address to find and price liquidity pairs.`,
    base: {
        staking: staking(["0x52eaecac2402633d98b95213d0b473e069d86590", '0x365c6d588e8611125De3bEA5B9280C304FA54113'], ALB),
        tvl: getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, }),
    }
};
