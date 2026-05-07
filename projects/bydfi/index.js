const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: { owners: bitcoinAddressBook.bydfi },
  ethereum: {
    owners: [
      '0x845DFA5366776fe44AA49e630C0C86A069D5acD4',
      '0x9772db485b028616e85a41b718047de21aef31fe'
    ],
  },
    ripple: {
    owners: [
      'rDrEru8GJAzzVEEunrLdd65YP5PppV8ESX',
      'rGzBXiAk5AhAmsCN2yZg9fmPzqsdyHttXt'
    ],
  },
}

module.exports = cexExports(config)