const { onChainTvl } = require("../helper/balancer");
const { getUniTVL } = require('../helper/unknownTokens');

const blacklistedTokens = [];

const V2_ADDRESS = "0x286381aEdd20e51f642fE4A200B5CB2Fe3729695";
const FACTORY_ADDRESS = "0xcB74d94Ddb0c365e62731FA289E90928C311223f";

const config = {
  linea: { fromBlock: 660572 },
};

module.exports = {
  boba: {
    tvl: getUniTVL({
      factory: FACTORY_ADDRESS,
      useDefaultCoreAssets: true,
    })
  },
  linea: {
    tvl: onChainTvl(V2_ADDRESS, config.linea.fromBlock, { blacklistedTokens }),
  },
};
