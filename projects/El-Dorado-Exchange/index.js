const sdk = require('@defillama/sdk');
const { gmxExports } = require("../helper/gmx");

const chain = "bsc";
module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([
      gmxExports({ chain, vault: '0x7f90C8De425e2E21F6d152e881713DE5Fe37dEAB', }),
    ])
  }
}