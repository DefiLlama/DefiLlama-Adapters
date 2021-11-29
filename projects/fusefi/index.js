const sdk = require('@defillama/sdk')
const fuseswap = require('../fuseswap')
const olalending = require('./olalending')

module.exports = {
    tvl: sdk.util.sumChainTvls(fuseswap, olalending),
}