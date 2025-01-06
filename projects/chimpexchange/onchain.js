const { onChainTvl } = require("../helper/balancer");

const blacklistedTokens = [];

const V2_ADDRESS = "0x286381aEdd20e51f642fE4A200B5CB2Fe3729695";

const config = {
  linea: { fromBlock: 660572 },
};

module.exports = {};

Object.keys(config).forEach((chain) => {
  const { fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: onChainTvl(V2_ADDRESS, fromBlock, { blacklistedTokens }),
  };
});
