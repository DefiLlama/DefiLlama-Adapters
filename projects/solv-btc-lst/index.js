const { sumTokens } = require('../helper/chain/bitcoin');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');
const { getConfig } = require('../helper/cache.js');

async function tvl() {
  return sumTokens({ owners: await bitcoinAddressBook.solvBTC() })
}


const solvbtclstListUrl = 'https://raw.githubusercontent.com/solv-finance/solv-protocol-defillama/refs/heads/main/solvbtc-lst.json';

async function evmTVL(api) {
  let solvbtclst = await getConfig('solv-protocol/solv-btc-lst-evm', solvbtclstListUrl)
  let { depositAddress: owners, tokens } = solvbtclst[api.chain]?.otherDeposit ?? {}
  return api.sumTokens({ owners, tokens })
}

module.exports = {
  methodology: 'Staked tokens via Babylon and Core are counted towards TVL, as they represent the underlying BTC assets securing their respective networks.',
  doublecounted: true,
  timetravel: false,
  bitcoin: { tvl }
}

const chains = ['ethereum']
chains.forEach(chain => {
  module.exports[chain] = { tvl: evmTVL }
})