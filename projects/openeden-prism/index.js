const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const { getEnv } = require('../helper/env')
const { nullAddress } = require('../helper/sumTokens')

const owners = [
  '0xb81a777a96603e69f990954b29ecf07f20669fb8',
  '0x10a5b1e4eb6887317c6a69f250dd740c01089fed',
  '0xf26ac2224954219d7fad39f77362b8cd2ee9f0cf',
]

const ACCOUNTABLE_API = 'https://accountable.openeden.com:8443/dashboard'
const DEBANK_API = 'https://pro-openapi.debank.com/v1/user'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

function addEthToken(api, token, chain) {
  if (chain !== 'eth') return
  const addr = token.id === 'eth' ? nullAddress : token.id
  api.add(addr, token.amount * 10 ** token.decimals)
}

async function tvl(api) {
  let debankUsd = 0
  const apiKey = getEnv('DEBANK_API_KEY')

  if (apiKey) {
    const headers = { accept: 'application/json', AccessKey: apiKey }

    for (const owner of owners) {
      // Wallet token balances
      const tokens = await get(`${DEBANK_API}/all_token_list`, {
        params: { id: owner, is_all: true },
        headers,
      })
      for (const token of tokens || []) {
        debankUsd += (token.amount || 0) * (token.price || 0)
        addEthToken(api, token, token.chain)
      }

      // DeFi protocol positions
      const protocols = await get(`${DEBANK_API}/all_complex_protocol_list`, {
        params: { id: owner, is_all: true },
        headers,
      })
      for (const protocol of protocols || []) {
        for (const item of protocol.portfolio_item_list || []) {
          for (const token of item.asset_token_list || []) {
            debankUsd += (token.amount || 0) * (token.price || 0)
            addEthToken(api, token, protocol.chain)
          }
        }
      }
    }
  }

  // Accountable total minus DeBank = off-chain reserves
  const accountable = await get(ACCOUNTABLE_API)
  const ts = Number(accountable.data.ts)
  if (Date.now() - ts > ONE_DAY_MS) throw new Error('Accountable data is stale')

  const remainder = accountable.data.reserves.total_reserves.value - debankUsd
  if (remainder > 0) {
    api.add(ADDRESSES.ethereum.USDT, remainder * 1e6)
  }
}

module.exports = {
  timetravel: false,
  ethereum: { tvl },
} // node test.js projects/openeden-prism/index.js
