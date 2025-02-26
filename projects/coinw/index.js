const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
       '0xa20f10289248717374e9b7776dc368aa526cb6f2', 
       '0x611f32e5d7f6640ecaf3e66759318abb9cbece64',
       '0x2d6323cc438b96f0ae942280762cc507b5398563',
       '0xbf2d58698a8a215f868cf24baba360c77266b466',
       '0x3864d8f360ba98212a2eddf05a357599f25196c1',
       '0xb840fe2b3fd8f75275240c671d6ec659e4c9a500',
       '0xe48a4e20be4ea888748c56bdcb632d960cbfb011'
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.coinw
  },
  tron: {
    owners: [
        'TEdzoWmVaKnSjvbY33FNjkGogo5xKUkSRD',
        'TXWmdMZkLA45WPiKqTMeLvcHPeZSj1npdp',
        'TRg92o9H1T7m5beDvTzqGYJ1CLoyEnjUpB',
        'TTvYfJhC45kLriLTEAbVawBrBQhAW8shh3'
    ]
  },
}

module.exports = cexExports(config)