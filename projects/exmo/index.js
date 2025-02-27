const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        '0x7029B8aaE2399a9f4B82d4516D6D16A35A52ff2e',
    ],
  },
  doge: {
    owners: [
        'DC1GBAsLTJMvShigDk4UR3oVnkmiH4xaoE',
    ]
  },
  ripple: {
    owners: [
        'rDfvwaonnG198FJKiugQDn96kVW4Ej6bUX',
    ]
  },
}

module.exports = cexExports(config)