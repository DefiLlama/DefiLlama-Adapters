const { getUniTVL } = require('../helper/unknownTokens')
const CBR = "0xE070B87c4d88826D4cD1b85BAbE186fdB14CD321";
const FACTORY = "0x32132625Cd02988Fb105FbbD3138bD383df3aF65"


module.exports = {
  misrepresentedTokens: true,
  methodology: `Uses Uniswap-style factory address to find and price liquidity pairs.`,
  blast: {
    tvl: getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, }),
  }
};