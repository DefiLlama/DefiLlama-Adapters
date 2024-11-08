const { staking } = require('../helper/staking');

module.exports = {
  polygon: {
    tvl: () => ({}),
    staking: staking(
      '0xee1198CF7575dfb2D5D666964322B6569B23E56b',
      '0xAFb755c5f2ea2aadBaE693d3BF2Dc2C35158dC04'
    )
  }
};
