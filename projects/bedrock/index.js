const { sumTokens } = require('../helper/chain/bitcoin')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const { getConfig } = require('../helper/cache.js')

async function tvl() {
  return sumTokens({ owners: await bitcoinAddressBook.bedrock() })
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  bitcoin: {
    tvl
  }
}

async function tvlEvm(api) {
  const API_URL = 'https://raw.githubusercontent.com/Bedrock-Technology/uniBTC/refs/heads/main/data/tvl/reserve_address.json'
  const { evm, } = await getConfig('bedrock.btc_address', API_URL)
  const chain = api.chain == 'btr' ? 'bitlayer' : api.chain
  const { vault, tokens } = evm[chain] ?? {}
  if (!vault) return;
  return api.sumTokens({ api, owner: vault, tokens })
}

['btr', 'ethereum', 'bsc', 'arbitrum', 'mantle', 'merlin', 'optimism', 'bob', 'bsquared', 'zeta', 'mode'].forEach(chain => {
  module.exports[chain] = { tvl: tvlEvm }
})