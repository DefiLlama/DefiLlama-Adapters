const { getLiquityTvl } = require('../helper/liquity')

module.exports = {
  methodology: "Deposited ETH and TLOS on the Base and Telos network",
  base: { tvl: getLiquityTvl("0x56a901FdF67FC52e7012eb08Cfb47308490A982C") },
  telos: { tvl: getLiquityTvl("0xF58e1a49168FC7f16C441b38701CFC9D8e29A074") },
};