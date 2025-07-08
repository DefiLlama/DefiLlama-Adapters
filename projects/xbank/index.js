const { compoundExports2 } = require('../helper/compound');

module.exports = {
  deadFrom: '2024-04-28',
  era: compoundExports2({
    comptroller: '0xC6d329a2C3f8cFDECAe7FeEc387fa633C6520991',
    cether: '0xE4622A57Ab8F4168b80015BBA28fA70fb64fa246',
  })
};

module.exports.era.borrowed = () => ({}) // bad debt