const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
       '0xb03eDB668008459B3c6D948ab5Ab305581DbF69c',
       '0x3d79007ba1a68de986eb641a3c24d58a0c69587e',
       '0xF884B1bC1d91Cdf824e7f35D61EdfdB042c28C83',
       '0xAd8E5cEb7D77e10403Be8430717c515273c31b8d'
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.biconomy
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
