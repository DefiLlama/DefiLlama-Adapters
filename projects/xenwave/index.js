const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require("../helper/unknownTokens");
const { mergeExports } = require("../helper/utils");

// const nullAddress = ADDRESSES.null;
//const wbtnBitnet = "0x8148b71232162ea7a0b1c8bfe2b8f023934bfb58"; // 210
//const usdtBitnet = "0xd9b4225b1872a008870bae4797ec6ebabf5e2e2f"; // 210
const dexFactory = "0xCba3Dc15Cfbcd900cF8133E39257c26727E86e3a"; // 210

const dexTVL = {

  /* Bitnet */
  bitnet: {
    tvl: getUniTVL({
      factory: dexFactory,
      useDefaultCoreAssets: true,
    }),
  },
  
};

const exportMethodoly = {
  
  methodology: `Xenwave calculated the TVL based on the amount of tokens pooled in its Liquidity Pools. You can visit https://xenwave.com for more information.`,

};

module.exports = mergeExports([dexTVL, exportMethodology]);
