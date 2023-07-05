const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0xfad531c62757cf18391E48Ee0959ab9ba106deCc",

    ],
  },
}

module.exports = cexExports(config)