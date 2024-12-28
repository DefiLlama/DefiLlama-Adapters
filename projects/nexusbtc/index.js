const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

//https://www.matrixport.com/nexusbtcReserve

module.exports = {
  methodology: 'The total value locked (TVL) is calculated by summing up the balances of BTC wallets specified in the NexusBTC address list within the bitcoin address book',
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.nexusbtc }),
  },
};