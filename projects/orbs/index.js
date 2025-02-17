const { staking } = require('../helper/staking');

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(
      '0x01d59af68e2dcb44e04c50e05f62e7043f2656c3',
      '0xff56Cc6b1E6dEd347aA0B7676C85AB0B3D08B0FA'
    ),
  },
};
