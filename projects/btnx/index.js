const { sumTokens } = require('../helper/chain/bitcoin')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

async function tvl() {
  return sumTokens({ owners: await bitcoinAddressBook.btnx() })
}

module.exports = {
  timetravel: false,
  bitcoin: { tvl }
}
