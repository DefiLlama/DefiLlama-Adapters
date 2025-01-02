const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        '0x29af949c3D218C1133bD16257ed029E92deFb168',
        '0x8Cad96fB23924Ebc37b8CdAFa8400AD856fE4a2C',
        '0xAeB81c391Ac427B6443310fF1cB73a21E071e5ad',
    ],
  },
  cardano: {
    owners: [
        'addr1q9phfjzqhcndne6chkxvtwt209n4335ghy0389mp5jfh3gyhry659z5gnwn04r2as2hy9m4uuqvlhjm0gm7r9dd7j65s7tsfxa',
        'addr1qywum3fvtfrw4t52xk6y2ls9dsgkgwk759fxrnpae7f4q5d3uk2aw97ypjvvf3kjy43pl4axma6c4sjadq2lwlx80tus3k4j0v'
    ]
  },
  bitcoin: {
    owners: bitcoinAddressBook.nbx
  }
}

module.exports = cexExports(config)