const { sumTokens } = require('../helper/chain/bitcoin')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

async function tvl() {
  return sumTokens({ owners: await bitcoinAddressBook.vishwa() })
}

module.exports = {
  timetravel: false,
  bitcoin: {
    tvl
  },
};