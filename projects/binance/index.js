const config = require('./config')
const { cexExports, getChainTvl } = require('../helper/cex')
const sdk = require('@defillama/sdk')
module.exports = cexExports(config)

const bscTvl = module.exports.bsc.tvl
module.exports.bsc.tvl = sdk.util.sumChainTvls([
  bscTvl, getChainTvl('bep2', config)
])
