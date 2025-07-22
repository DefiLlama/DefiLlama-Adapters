const { sumTokensExport, nullAddress, } = require('../helper/sumTokens')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  methodology: 'Total amount of BTC locked in Bitcoin network on wallet bc1qmukuv7j57umsd5tgg9fw88eqap57rzphkfckyp',
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.jbtc }),
  },
  ethereum: {
    tvl: sumTokensExport({ owners: ['0x7e90Ef7D172843dB68e42FC5fAA8CB7C1803Dcfa'], tokens: [nullAddress] }),
  },
}
