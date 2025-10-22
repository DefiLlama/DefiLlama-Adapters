const sdk = require('@defillama/sdk')
const { compoundExports2 } = require('../helper/compound')

const coreExports = compoundExports2({
  comptroller: "0x90f2810B85f02122159cB18f6abF2776a7Ca3152",
  cether: "0x3a6F5eA6b9B781C37F25164D9c25534eDd87d290",
})

const degenExports = compoundExports2({
  comptroller: "0x410ffcC8f37dCb3116cA8F59B30CCbe4c60F2385",
  cether: "0x2ff7bF02a7C4f63fBc3b764A12c723B2abdA2905",
})

module.exports = {
  era: {
    tvl: sdk.util.sumChainTvls([coreExports.tvl, degenExports.tvl]),
    borrowed: sdk.util.sumChainTvls([coreExports.borrowed, degenExports.borrowed])
  }
}