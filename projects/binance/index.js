const config = require('./config')
const { cexExports, } = require('../helper/cex')
module.exports = cexExports(config)
