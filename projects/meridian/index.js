const { getLiquityTvl } = require('../helper/liquity')

module.exports = {
  methodology: "Deposited ETH and TLOS on the Base and Telos network",
  base: { tvl: getLiquityTvl("0x56a901FdF67FC52e7012eb08Cfb47308490A982C") },
  telos: { tvl: getLiquityTvl("0xb1F92104E1Ad5Ed84592666EfB1eB52b946E6e68") },
};