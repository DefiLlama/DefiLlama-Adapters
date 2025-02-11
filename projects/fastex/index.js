const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        '0xc21a1d213f64fedea3415737cce2be37eb59be81',
        '0x85e1de87a7575c6581f7930f857a3813b66a14d8',
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.fastex
  },
  tron: {
    owners: [
        'TPj7TCJ9rxdd243yQ3tc7iJzqcEYtupB4v'
        'TXW8f2umgDJhVarwosuGW1d8Wr4FaPpAEb'
        'TDwRF28KJQhcGV46yRDFXgFdcLbztjxVbs'
    ]
  },
 Litecoin: {
   owners: [
      'ltc1qy4400xa5r72lsysd7xvjks08r5lrzr5fu0udx7'
   ]
 }
bahamut: {
  owners: [
    '0x42739513e14433d43084Ddb280531Ad1122D63d6'
  ]
}
}

module.exports = cexExports(config)
