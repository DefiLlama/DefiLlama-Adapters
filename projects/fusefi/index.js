const sdk = require('@defillama/sdk')
const swap = require('./swap')
const olalending = require('./olalending')

module.exports = {
    tvl: sdk.util.sumChainTvls(swap, olalending),
}