const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY = "0x2b6852CeDEF193ece9814Ee99BE4A4Df7F463557" // This factory is on AirDAO Mainnet (Chain Id: 16718)

const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, })

module.exports = {
  misrepresentedTokens: true,
  methodology: `Uses factory(${FACTORY}) address to find and price Liquidity Pool pairs.`,
  airdao: {
    tvl: dexTVL
  }
};
