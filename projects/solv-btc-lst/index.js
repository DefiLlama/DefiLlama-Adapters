const { sumTokens } = require('../helper/chain/bitcoin');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');
const { getConfig } = require('../helper/cache.js');

async function tvl() {
  return sumTokens({ owners: await bitcoinAddressBook.solvBTC() })
}


const solvbtclstListUrl = 'https://raw.githubusercontent.com/solv-finance-dev/slov-protocol-defillama/main/solvbtc-lst.json';

async function evmTVL(api) {
  let solvbtclst = await getConfig('solv-protocol/solv-btc-lst', solvbtclstListUrl)
  let { depositAddress: owners, tokens } = solvbtclst[api.chain]?.otherDeposit ?? {}
  api.sumTokens({ owners, tokens })
}

module.exports = {
  methodology: 'Staked tokens via Babylon and Core are counted towards TVL, as they represent the underlying BTC assets securing their respective networks.',
  doublecounted: true,
  bitcoin: { tvl }
}

const chains = ['ethereum']
chains.forEach(chain => {
  module.exports[chain] = { tvl: evmTVL }
})