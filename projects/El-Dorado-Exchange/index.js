const sdk = require('@defillama/sdk');
const { gmxExports } = require("../helper/gmx");

module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([
      gmxExports({ vault: '0x7f90C8De425e2E21F6d152e881713DE5Fe37dEAB', }),
    ])
  }
}