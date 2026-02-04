const { getUniTVL } = require("../helper/unknownTokens");
const FACTORY = "0x79b8F15a3bEEcd5014B748499Ec89692665ea368";

const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true,  })

module.exports = {
  misrepresentedTokens: true,
  methodology: `Uses factory(${FACTORY}) address and whitelisted tokens address to find and price Liquidity Pool pairs. We also have our native token $IKE staking.`,
  base: {
    tvl: dexTVL,
  },
}  