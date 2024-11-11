const { sumTokens } = require('../helper/chain/bitcoin')
const { sumTokens2 } = require('../helper/unwrapLPs')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

async function tvlBitcoin(api) {
  const addrBook = await bitcoinAddressBook.bedrock()
  return sumTokens({ owners: addrBook.btc })
}

async function tvlEvm(api) {
  const addrBook = await bitcoinAddressBook.bedrock()
  const chain = api.chain == 'btr' ? 'bitlayer' : api.chain
  const a = addrBook.evm[chain]
  if (!a || !a["tokens"]) {
    return
  }
  return sumTokens2({ api: api, owner: a.vault, tokens: a.tokens})
}

module.exports = {
  doublecounted: true,
  bitcoin: {
    tvl: tvlBitcoin
  },
};

['btr', 'ethereum', 'bsc', 'arbitrum', 'mantle', 'merlin', 'optimism', 'bob', 'bsquared', 'zeta', 'mode'].forEach(chain => {
  module.exports[chain] = {
    tvl: tvlEvm
  }
});