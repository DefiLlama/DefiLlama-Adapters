const { cexExports } = require('../helper/cex')
const bitcoinOwners = require('./bitcoin.json')

const config = {
  bitcoin: {
    owners: [].concat(bitcoinOwners.core, bitcoinOwners.bbn),
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'Staked tokens via Babylon and Core are counted towards TVL, as they represent the underlying BTC assets securing their respective networks.'