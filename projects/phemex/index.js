const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
        '3PiGxVdpMjWSsH8X8BypdwcsmPW5cmE4Ta',
    ]
  },
  ethereum: {
    owners: [
      '0xf7D13C7dBec85ff86Ee815f6dCbb3DEDAc78ca49'
    ],
  },
}

module.exports = cexExports(config)
module.exports.methodology = 'We are only tracking part of their cold wallets, more information here https://phemex.com/proof-of-reserves'