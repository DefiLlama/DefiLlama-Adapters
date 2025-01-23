const { getLiquityTvl } = require('../helper/liquity')

module.exports = {
  methodology: "Deposited Collateral on Meridian Mint",
  base: { tvl: getLiquityTvl("0x56a901FdF67FC52e7012eb08Cfb47308490A982C") },
  telos: { tvl: getLiquityTvl("0xb1F92104E1Ad5Ed84592666EfB1eB52b946E6e68") },
  fuse: { tvl: getLiquityTvl("0xCD413fC3347cE295fc5DB3099839a203d8c2E6D9") },
  tara: { tvl: getLiquityTvl("0xd2ff761A55b17a4Ff811B262403C796668Ff610D") },
};

