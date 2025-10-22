const { defaultTokens } = require('../helper/cex')
const { sumTokensExport, sumTokens } = require('../helper/sumTokens')
const { nullAddress } = require('../helper/unwrapLPs')
const { getStakedEthTVL, mergeExports } = require('../helper/utils')
const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const ENDPOINT = "https://www.binance.com/bapi/apex/v1/public/apex/market/por/address"

const binanceToDefillama = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BEP20: 'bsc',
  BSC: 'bsc',
  CELO: 'celo',
  CHZ2: 'chz',
  HBAR: 'hedera',
  TRX: 'tron',
  AVAX: 'avax',
  ARB: 'arbitrum',
  ARBITRUM: 'arbitrum',
  AVAXC: 'avax',
  LTC: 'litecoin',
  MATIC: 'polygon',
  OP: 'optimism',
  OPTIMISM: 'optimism',
  RON: 'ronin',
  XRP: 'ripple',
  SOL: 'solana',
  DOT: 'polkadot',
  ALGO: 'algorand',
  APT: 'aptos',
  FTM: 'fantom',
  BASE: 'base',
  ERA: 'era',
  ZKSYNCERA: 'era',
  MANTA: 'manta',
  SUI: 'sui',
  TON: 'ton',
  STK: 'starknet',
  STARKNET: 'starknet',
  OPBNB: 'op_bnb',
  NEAR: 'near',
  DOGE: 'doge',
  XLM: 'stellar',
  SCROLL: "scroll",
  SONIC: "sonic",
  PLASMA: "plasma",
}

const withdrawalAddresses = [
  '0x6454ac71ca260f99cca99a3f4241dfda20cfa965',
  '0xdbeb6c856ef5a167f5e1acb9dff65adb33207d8b',
  '0x42a93a9f5cfda54716c414b6eaf07cf512f46ead',
  '0x8498fc7280668874a5da79e87ca0896f4f0d1196',
  '0x8e609ac80f4324e499a6efd24f221a2caa868224',
  '0xdbf28a152d79b2b98eecd229b412ee98d21ec3bc',
  '0x110daa3f3fac2a54bb508ac94f31f9df77057b29',
  '0xfc8059c2fb22005ede8a86d388e3d0f536a4dd44',
  '0xf16924b866e58ac916ba933d1f1034bcbbb1958c',
  '0x150aace136535a374f05b5ee209b6a61396db1c0',
  '0x8a6f8404c9ea4c33502a3f6a4bf8e41ef5ca10ea',
  '0xa9fc92f6faf9f103fc81d17de3e8daadc888afff',
  '0xc47b3342df38d747033b6041f54e4e5e300c8d18',
  '0xf1f8cb7633d3ca3fd06c084d18ca5491a85ae9b4',
  '0xa345dcb63f984ed1c6d1a8901e0cdbd13b2b4d19',
  '0xd27b39cb25fed854f9fce3a4e451f96e62089e48',
  '0x6357e4bdaff733dfe8f50d12d07c03b3bed0884b',
]

const chainToNetworks = {}
for (const [network, chain] of Object.entries(binanceToDefillama)) {
  const c = chain.toLowerCase()
  const n = network.toUpperCase()
  if (!chainToNetworks[c]) chainToNetworks[c] = []
  if (!chainToNetworks[c].includes(n)) chainToNetworks[c].push(n)
}

const perChainConfig = {
  ethereum: { blacklistedTokens: ['0x9be89d2a4cd102d8fecc6bf9da793be995c22541', ADDRESSES.ethereum.BNB] },
  bsc: { blacklistedTokens: [ADDRESSES.bsc.BTCB, ADDRESSES.bsc.TUSD] },
  solana: { blacklistedTokens: ['7XU84evF7TH4suTuL8pCXxA6V2jrE8jKA6qsbUpQyfCY', 'CQvadZTR8vikRqqwyhvYV8YpdfCRjUCGyQwCuY4rxBQt'] },
}

function buildConfig(chain, owners) {
  const base = perChainConfig[chain] || {}
  let { tokensAndOwners, tokens, blacklistedTokens, fungibleAssets } = base

  if (!tokensAndOwners && !tokens && chain !== 'solana') {
    tokens = defaultTokens[chain]
    if (!tokens) tokens = [nullAddress]
  }

  const options = { ...base, owners, tokens, chain, blacklistedTokens }

  if (chain === 'ton') options.onlyWhitelistedTokens = true
  if (chain === 'aptos' && Array.isArray(fungibleAssets)) options.fungibleAssets = fungibleAssets
  if (chain === 'solana') {
    options.solOwners = owners
    delete options.owners
    if (!options.blacklistedTokens) options.blacklistedTokens = []
    options.blacklistedTokens.push('rTCAfDDrTAiP2hxBdfRtqnVZ9SF9E9JaQn617oStvPF')
  }

  return options
}

const tvl = async (api) => {
  const chain = api.chain.toLowerCase()
  const networks = chainToNetworks[chain]

  const data  = await getConfig('binance-cex/all-assets', ENDPOINT)

  const contracts = data.data
    .filter(({ network }) => networks.includes(network.toUpperCase()))
    .map(({ address }) => address)
    .filter(Boolean)

  const owners = [...new Set(contracts)]
  const options = buildConfig(chain, owners)

  return await sumTokensExport(options)(api)
}

const chainExports = {}
const chains = new Set(Object.values(binanceToDefillama))
chains.forEach((chain) => { chainExports[chain] = { tvl } })

const ethStakedExport = { ethereum: { tvl: getStakedEthTVL({ withdrawalAddresses, size: 200, sleepTime: 20_000, proxy: true }) } }

module.exports = mergeExports([chainExports, ethStakedExport])
module.exports.methodology = 'We collect the wallets from this Binance blog post https://www.binance.com/en/blog/community/our-commitment-to-transparency-2895840147147652626. We are not counting the Binance Recovery Fund wallet. On Ethereum, we also include staked ETH tracked via known withdrawal addresses.'

module.exports.bitcoin = { tvl: bitcoinTvl }

async function bitcoinTvl(api) {
  return sumTokens({ api, owners: await bitcoinAddressBook.binanceFetcher() })
}
