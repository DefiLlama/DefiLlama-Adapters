const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: ['bc1qaxyju6n2x2tednv8e7hgnhnz44vrfcmuhjxpfk']
  },
}

module.exports = cexExports(config)
