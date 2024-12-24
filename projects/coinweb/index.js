const { staking } = require('../helper/staking');

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(
      '0x13Fe7160858F2A16b8e4429DFf26c8a3A4b12b1B',
      '0x505B5eDa5E25a67E1c24A2BF1a527Ed9eb88Bf04' // CWEB
    ),
  },
};
