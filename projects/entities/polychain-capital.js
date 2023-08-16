const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0xBcd5000F5c522856E710c5d274bb672B2f2EefBf",
        "0x53c286E0AbE87c9e6d4d95ebE62ceaFa4aFCE849"
    ],
  },

}

module.exports = cexExports(config)