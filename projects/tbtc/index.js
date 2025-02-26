const { sumTokens } = require('../helper/chain/bitcoin')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

async function tvl() {
  return sumTokens({ owners: await bitcoinAddressBook.tBTC() })
}

module.exports = {
  timetravel: false,
  methodology: "BTC on btc chain",
  ethereum: { tvl: () => ({}) },
  bitcoin: { tvl },
};
