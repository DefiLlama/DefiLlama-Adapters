const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
       '0x8b802fa7b71ea532187e432d9b87d24cc904243a', // https://blog.cakedefi.com/whats-new-with-our-lending-service/
    ],
  },
  bitcoin: {
    owners: ['3HRPnc4SddsFjrLVTfuTZJ2kQhdyCaHT4G']
  }
}

module.exports = cexExports(config)