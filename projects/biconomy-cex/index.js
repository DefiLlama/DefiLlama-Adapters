const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
       '0xb03eDB668008459B3c6D948ab5Ab305581DbF69c'
    ],
  },
  bitcoin: {
    owners: [
        'bc1qx70fn2550vhjetc748wmg4lzv5gy7t56ns92v8'
    ]
  },
  polygon: {
    owners: [
        '0x366ba28Ec89113454EA6e82bB606426e8cA22780'
    ],
  },
  tron: {
    owners: [
        'TEi2hVWDRMo61PAoi1Dwbn8hNXufkwEVyp'
    ]
  },
}

module.exports = cexExports(config)
