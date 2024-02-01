const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0x6081258689a75d253d87cE902A8de3887239Fe80",
        "0x40b38765696e3d5d8d9d834d8aad4bb6e418e489",
    ],
  },
  bitcoin: {
    owners: [
        "bc1qprdf80adfz7aekh5nejjfrp3jksc8r929svpxk",
        "bc1qmxcagqze2n4hr5rwflyfu35q90y22raxdgcp4p",
        "bc1ql49ydapnjafl5t2cp9zqpjwe6pdgmxy98859v2"
    ],
  },
  polygon: {
    owners: [
        "0x6081258689a75d253d87cE902A8de3887239Fe80",
    ],
  },
  avax: {
    owners: [
        "0x6081258689a75d253d87cE902A8de3887239Fe80",
        "0x40b38765696e3d5d8d9d834d8aad4bb6e418e489",
    ],
  },
}

module.exports = cexExports(config)
