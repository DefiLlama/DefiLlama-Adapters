const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')

const HONK = "0xF2d4D9c65C2d1080ac9e1895F6a32045741831Cd";
const WBCH = ADDRESSES.smartbch.WBCH;
const FACTORY = "0x34D7ffF45108De08Ca9744aCdf2e8C50AAC1C73C";

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x34D7ffF45108De08Ca9744aCdf2e8C50AAC1C73C) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  smartbch: {
    tvl: getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true }),
  }
}
