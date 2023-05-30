const config = require('./config')
const { cexExports, } = require('../helper/cex')
module.exports = cexExports(config)
module.exports.methodology = 'We collect the wallets from this binance blog post https://www.binance.com/en/blog/community/our-commitment-to-transparency-2895840147147652626. We are not counting the Binance Recovery Fund wallet'