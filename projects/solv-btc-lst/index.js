const { sumTokens } = require('../helper/chain/bitcoin');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

async function tvl() {
  return sumTokens({ owners: await bitcoinAddressBook.solvBTC() })
}

module.exports = {
  methodology: 'Staked tokens via Babylon and Core are counted towards TVL, as they represent the underlying BTC assets securing their respective networks.',
  doublecounted:true,
  bitcoin: { tvl }
}