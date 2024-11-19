const { sumTokens } = require('../helper/chain/bitcoin')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

async function tvl() {
  const btcAddr = await bitcoinAddressBook.bedrock()
  return sumTokens({ owners: btcAddr.map(a => a.addr) })
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  bitcoin: {
    tvl
  }
}