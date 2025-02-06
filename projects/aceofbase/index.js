const { getUniTVL } = require('../helper/unknownTokens')
const ACE = "0xb1a45A38b88b2183f7523Db2E5E5CEa55b050958";
const FACTORY = "0x46C6706E81CAD3173773c1ffb5D84C9eb652d570"

const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(${FACTORY}) address and whitelisted tokens address to find and price Liquidity Pool pairs. We also have our native token $ACE staking.`,
    base: {
        tvl: dexTVL,
    }
};
