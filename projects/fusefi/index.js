const sdk = require('@defillama/sdk')
const swap = require('./swap')
const olalending = require('./olalending')

module.exports = {
    fuse:{
        tvl: sdk.util.sumChainTvls([swap.tvl, olalending.tvl]),
        borrowed: olalending.borrowed
    }
}