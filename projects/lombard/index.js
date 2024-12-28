const { sumTokens } = require('../helper/chain/bitcoin')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

async function tvl() {
  return sumTokens({ owners: await bitcoinAddressBook.lombard() })
}

module.exports = {
  doublecounted:true,
  timetravel: false,
  isHeavyProtocol: true,
  bitcoin: { tvl }
}