const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY_ADDRESS = '0x603EfDF29606BfB90f8f1068828c79cB2d5eD056'

const dexTVL = getUniTVL({ 
  factory: FACTORY_ADDRESS, 
  useDefaultCoreAssets: true,
})

module.exports = {
  misrepresentedTokens: true,
  methodology: `Uses factory address (${FACTORY_ADDRESS}) to find and price liquidity pool pairs`,
  stable: {
    tvl: dexTVL,
  }
};

