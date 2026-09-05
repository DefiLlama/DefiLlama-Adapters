const { defaultTokens } = require('../helper/cex')
const { sumTokensExport } = require('../helper/sumTokens')
const { nullAddress } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

// Collateral Binance locks on the native chain to back Binance-Peg tokens issued on
// other chains (mostly BNB Chain). The liabilities behind these wallets are peg-token
// holders, not exchange customers, so they are tracked here rather than under the
// Binance CEX entry. Same endpoint the CEX adapter uses for its wrapped-token blacklist.
const LOCK_INFO_ENDPOINT = "https://www.binance.com/bapi/tokencanal/v2/tokencanal/lockinfo"

// BTC is deliberately excluded, for two independent reasons:
//  1. the backing for Binance-Peg BTC is already tracked as its own Bridge entry
//     ("Binance Bitcoin"), so including it here would double count;
//  2. the lockinfo endpoint returns the BTC wallet lowercased
//     ("3lyjfcfhpxyjremsask2jkn69lweykzexb"), which fails Base58Check and 404s on
//     explorers. The correct-case address is already in helper/bitcoin-book as
//     `binance2`, which is what projects/binance uses for the bitcoin chain.
const binanceToDefillama = {
  ETH: 'ethereum',
  BEP20: 'bsc',
  BSC: 'bsc',
  TRX: 'tron',
  TRON: 'tron',
  AVAX: 'avax',
  AVAXC: 'avax',
  MATIC: 'polygon',
  ARB: 'arbitrum',
  ARBITRUM: 'arbitrum',
  OP: 'optimism',
  OPTIMISM: 'optimism',
  LTC: 'litecoin',
  XRP: 'ripple',
  SOL: 'solana',
  DOT: 'polkadot',
  ALGO: 'algorand',
  APT: 'aptos',
  BASE: 'base',
  NEAR: 'near',
  DOGE: 'doge',
  XLM: 'stellar',
}

const chainToNetworks = {}
for (const [network, chain] of Object.entries(binanceToDefillama)) {
  const c = chain.toLowerCase()
  const n = network.toUpperCase()
  if (!chainToNetworks[c]) chainToNetworks[c] = []
  if (!chainToNetworks[c].includes(n)) chainToNetworks[c].push(n)
}

const evmChains = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avax', 'base']

async function getLockAddresses(chain) {
  const networks = chainToNetworks[chain]
  const isEvm = evmChains.includes(chain)
  const lockInfoData = await getConfig('binance-peg-backing/lock-info', LOCK_INFO_ENDPOINT)
  // getConfig falls back to the cached config when the endpoint is unavailable, and an
  // adapter on its first run has no cache to fall back to - so the shape is not guaranteed.
  const tokens = Array.isArray(lockInfoData?.tokens) ? lockInfoData.tokens : []

  const addresses = []
  tokens.forEach(token => {
    const locks = Array.isArray(token?.lockInfo) ? token.lockInfo : []
    locks.forEach(li => {
      if (typeof li?.network !== 'string' || typeof li?.address !== 'string') return
      if (!networks.includes(li.network.toUpperCase())) return
      if (/^[A-Z0-9]+-[A-Z0-9]+$/i.test(li.address)) return
      if (isEvm && (!/^0x[0-9a-fA-F]{40}$/.test(li.address))) return
      addresses.push(li.address)
    })
  })
  return [...new Set(addresses)]
}

const tvl = async (api) => {
  const chain = api.chain.toLowerCase()
  const owners = await getLockAddresses(chain)
  if (!owners.length) return {}

  const options = { owners, chain, permitFailure: true }
  if (chain === 'solana') options.solOwners = owners
  else options.tokens = defaultTokens[chain] || [nullAddress]

  return sumTokensExport(options)(api)
}

module.exports = { methodology: 'Assets held in the wallets Binance publishes as the on-chain backing for Binance-Peg tokens (tokencanal lockinfo endpoint). These back peg-token holders on the destination chain, not exchange customer deposits, so they are reported separately from the Binance CEX entry.' }

Object.values(binanceToDefillama).forEach(chain => { module.exports[chain] = { tvl } })
