const { sumTokens } = require('../helper/chain/bitcoin')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const { getConfig } = require('../helper/cache.js')

async function tvl() {
  return sumTokens({ owners: await bitcoinAddressBook.bedrock() })
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  start: '2024-04-13',
  bitcoin: {
    tvl
  }
}

async function tvlEvm(api) {
  // const API_URL = 'https://raw.githubusercontent.com/Bedrock-Technology/uniBTC/refs/heads/main/data/tvl/reserve_address.json'
  const API_URL = 'https://bedrock-datacenter.rockx.com/uniBTC/reserve/address'
  const { evm, } = await getConfig('bedrock.evm_address', API_URL)

  const chainAlias = { 'btr': 'bitlayer', 'berachain': 'bera', 'rsk': 'rootstock' }
  const chain = chainAlias[api.chain] ? chainAlias[api.chain] : api.chain
  const { vault, tokens } = evm?.[chain] ?? {}
  if (!vault) return;
  return api.sumTokens({ api, owner: vault, tokens })
}

['base', 'hemi', 'rsk', 'tac', 'taiko', 'btr', 'ethereum', 'bsc', 'arbitrum', 'mantle', 'merlin', 'optimism', 'bob', 'bsquared', 'zeta', 'mode', 'berachain'].forEach(chain => {
  module.exports[chain] = { tvl: tvlEvm }
})
