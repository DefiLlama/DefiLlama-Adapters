const { sumTokens } = require('../helper/chain/bitcoin')
const sdk = require('@defillama/sdk')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const abi = {
  getQualifiedUserInfo: 'function getQualifiedUserInfo(address _user) view returns ((bool locked, string depositAddress, string withdrawalAddress) info)',
}

async function tvl() {
  return sumTokens({ owners: await bitcoinAddressBook.fbtc() })
}

module.exports = {
  timetravel: false,
  bitcoin: { tvl }
}
