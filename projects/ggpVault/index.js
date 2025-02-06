const { sumERC4626VaultsExport } = require('../helper/erc4626')

module.exports = {
  avax: {
    tvl: sumERC4626VaultsExport({ vaults: ['0xdF34022e8a280fc79499cA560439Bb6f9797EbD8', '0x36213ca1483869c5616be738Bf8da7C9B34Ace8d'], isOG4626: true })
  },
};
