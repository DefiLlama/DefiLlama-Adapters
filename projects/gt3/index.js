// projects/gt3/index.js
const { getUniTVL } = require('../helper/unknownTokens');

const CHAIN = "polygon";
const GT3_FACTORY_ADDRESS = "0x2d7360Db7216792cfc2c73B79C0cA629007E2af4";

const tvl = getUniTVL({ factory: GT3_FACTORY_ADDRESS, chain: CHAIN, useDefaultCoreAssets: true });

module.exports = {
  methodology: "The TVL is calculated by adding the liquidity of all pairs on the gt3.finance exchange, obtained through the Factory contract.",
  [CHAIN]: { // Exportar por cadena
    tvl: tvl,
  },
};
