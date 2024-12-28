const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
    //  '0xe43c53c466a282773f204df0b0a58fb6f6a88633',     Old wallets
    //  '0x2b097741854eedeb9e5c3ef9d221fb403d8d8609',     Old wallets
    //  '0x686b9202a36c09ce8aba8b49ae5f75707edec5fe',     Old wallets
    //  '0xef7a2610a7c9cfb2537d68916b6a87fea8acfec3',     Old wallets
      '0x5631aa1fc1868703a962e2fd713dc02cad07c1db',     
      '0x4785e47ae7061632c2782384da28b9f68a5647a3',
      '0x25Ee4Ce905Da85df8620cB82884adDf96A14498A',
      '0xE1E5F8caCc6B9Ace0894Fe7ba467328587e60bE7',
      '0xb8001c3ec9aa1985f6c747e25c28324e4a361ec1'  //cobo wallet     
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.bitvenus
  },
  bsc: {
    owners: [
      //  '0xef7a2610a7c9cfb2537d68916b6a87fea8acfec3',
        '0x4785e47aE7061632C2782384DA28B9F68a5647a3'
    ]
  },
  tron: {
    owners: [
        'TPbExxiw99nMsDfWVjaweSPkMVQfZSVVZj', 
        'TSM8m5ADsMRySsWy7d4REX7FBXusMQCi6y'
    ]
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'This wallets where provide by BitVenus team on the 07/02/2023. *On the 14/07/2023 BitVenus team provided new wallets. A new wallet was provide on the 15/12/2023 by bitvenus team'