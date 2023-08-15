const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    // wallet provide by a bitmake team
    owners: [
        "3F12ncAyx4VkfpvnS7ZxdpggFx4p9RKfVe",
    ],
  },
}

module.exports = cexExports(config)
module.exports.methodology = 'We are only tracking one BTC wallet. We dont have information regarding other wallets'