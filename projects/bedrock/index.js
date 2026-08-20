const ADDRESSES = require('../helper/coreAssets.json')
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

// Merlin's M-BTC, which coreAssets already registers as merlin WBTC_1. Its own
// price feed is unusable: only 7 of the last 14 days carry a quote at all, and on
// the days that do the value wanders far off BTC (exact parity on 08-12 and 08-17,
// 19% below on 08-07). A day with no quote drops the whole position, which is what
// makes the published series flap - M-BTC is 57.7M of a 316M protocol.
// Counted as BTC instead, which is quoted every day.
const MBTC = ADDRESSES.merlin.WBTC_1.toLowerCase()

async function tvlEvm(api) {
  // const API_URL = 'https://raw.githubusercontent.com/Bedrock-Technology/uniBTC/refs/heads/main/data/tvl/reserve_address.json'
  const API_URL = 'https://bedrock-datacenter.rockx.com/uniBTC/reserve/address'
  const { evm, } = await getConfig('bedrock.evm_address', API_URL)

  const chainAlias = { 'btr': 'bitlayer', 'berachain': 'bera', 'rsk': 'rootstock' }
  const chain = chainAlias[api.chain] ? chainAlias[api.chain] : api.chain
  const { vault, tokens } = evm?.[chain] ?? {}
  if (!vault) return;

  const isMBTC = (token) => api.chain === 'merlin' && token.toLowerCase() === MBTC
  await api.sumTokens({ api, owner: vault, tokens: tokens.filter(i => !isMBTC(i)) })

  if (tokens.some(isMBTC)) {
    const balance = await api.call({ target: MBTC, abi: 'erc20:balanceOf', params: [vault] })
    api.addCGToken('bitcoin', balance / 1e18)   // M-BTC is 18 decimals
  }

  return api.getBalances()
}

['base', 'hemi', 'rsk', 'tac', 'taiko', 'btr', 'ethereum', 'bsc', 'arbitrum', 'mantle', 'merlin', 'optimism', 'bob', 'bsquared', 'zeta', 'mode', 'berachain'].forEach(chain => {
  module.exports[chain] = { tvl: tvlEvm }
})
