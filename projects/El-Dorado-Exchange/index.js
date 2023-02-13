const sdk = require('@defillama/sdk');
const { gmxExports } = require("../helper/gmx");

module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([
      gmxExports({ vault: '0x7f90C8De425e2E21F6d152e881713DE5Fe37dEAB', }),
      gmxExports({ vault: '0x2c7077cF9bd07C3BC45B4E5b8C27f8B95c6550B3', }),
    ])
  }
}