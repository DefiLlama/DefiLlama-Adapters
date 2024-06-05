const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY = "0xe63Cf585Dae8273A5e37AfF6da2f823FBf3Eb5BE" // This factory is on AirDAO Mainnet (Chain Id: 16718)

const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, fetchBalances: true, })

module.exports = {
  misrepresentedTokens: true,
  methodology: `Uses factory(${FACTORY}) address to find and price Liquidity Pool pairs.`,
  airdao: {
    tvl: dexTVL
  }
};
