const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  bsquared: {
    tvl: sumTokensExport({ owner: '0x5b1399B8b97fBC3601D8B60Cc0F535844C411Bd5', tokens: [ADDRESSES.bsquared.UBTC]})
  },
  bitcoin: { tvl: sumTokensExport({ owners: bitcoinAddressBook.echoMonadEBTC }) }
}