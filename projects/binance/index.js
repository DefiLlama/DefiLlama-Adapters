const { defaultTokens } = require('../helper/cex')
const { sumTokensExport, sumTokens } = require('../helper/sumTokens')
const { nullAddress } = require('../helper/unwrapLPs')
const { getStakedEthTVL, mergeExports } = require('../helper/utils')
const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const { getCEXTokensOnBinanceOnChain } = require('../helper/utils/cex.js')

const ENDPOINT = "https://www.binance.com/bapi/apex/v1/public/apex/market/por/address"
const LOCK_INFO_ENDPOINT = "https://www.binance.com/bapi/tokencanal/v2/tokencanal/lockinfo"

const binanceToDefillama = {
  BTC: 'bitcoin',
  ADA: 'cardano',
  ZEC: 'zcash',
  ETH: 'ethereum',
  BEP20: 'bsc',
  BSC: 'bsc',
  CELO: 'celo',
  CHZ2: 'chz',
  BCH: 'bitcoincash',
  HBAR: 'hedera',
  TRX: 'tron',
  TRON: 'tron',
  AVAX: 'avax',
  ARB: 'arbitrum',
  ARBITRUM: 'arbitrum',
  ARC: 'arc',
  AVAXC: 'avax',
  LTC: 'litecoin',
  MATIC: 'polygon',
  OP: 'optimism',
  OPTIMISM: 'optimism',
  RON: 'ronin',
  ROBINHOOD: 'robinhood',
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
  STATEMINT: 'polkadot',
  KAVAEVM: 'kava',
  KAIA: 'klaytn',
  SEIEVM: 'sei',
  XTZ: 'tezos',
  WLD: 'wc',
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
const binanceBridgedTokens = [
  '0x570a5d26f7765ecb712c0924e4de545b89fd43df', // SOL
  "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47", // ADA
  "0xba2ae424d960c26247dd6c32edc70b295c744c43", // DOGE
  "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", // LINK
  "0x7083609fce4d1d8dc0c979aab8c869ea2c873402", // DOT
  "0x2859e4544c4bb03966803b044a93563bd2d0dd4d", // SHIB
  "0x4338665cbb7b2485a8855a139b75d5e34ab0db94", // LTC
  "0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe", // XRP
  "0xa2b726b1145a4773f68593cf171187d8ebe4d495", // INJ
  "0x1fa4a73a3f0133f0025378af00236f3abdee5d63", // NEAR
  "0x6FDcdfef7c496407cCb0cEC90f9C5Aaa1Cc8D888", // VET
  "0xfb6115445Bff7b52FeB98650C87f44907E58f802", // AAVE
  "0x62d0a8458ed7719fdaf978fe5929c6d342b0bfce", // BEAM
  "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153", // FIL
  "0x43C934A845205F0b514417d757d7235B8f53f1B9", // XLM
  "0x1Ba42e5193dfA8B03D15dd1B86a3113bbBEF8Eeb", // ZEC
]

const chainToNetworks = {}
for (const [network, chain] of Object.entries(binanceToDefillama)) {
  const c = chain.toLowerCase()
  const n = network.toUpperCase()
  if (!chainToNetworks[c]) chainToNetworks[c] = []
  if (!chainToNetworks[c].includes(n)) chainToNetworks[c].push(n)
}

const perChainConfig = {
  ethereum: {
    blacklistedTokens: [
      ADDRESSES.ethereum.BNB,
      ADDRESSES.bsc.wBETH, // wBETH, we are already counting staked ETH via withdrawal addresses, so we don't want to double count it
    ]
  },
  bsc: {
    blacklistedTokens: [
      ADDRESSES.bsc.TUSD,
      ADDRESSES.bsc.wBETH, // wBETH
      ...binanceBridgedTokens,
    ]
  },
  solana: { blacklistedTokens: ['7XU84evF7TH4suTuL8pCXxA6V2jrE8jKA6qsbUpQyfCY', 'CQvadZTR8vikRqqwyhvYV8YpdfCRjUCGyQwCuY4rxBQt'] },
}

function buildConfig(chain, owners, binanceTokensOnChain, wrappedTokens) {
  const base = perChainConfig[chain] || {}
  let { tokensAndOwners, tokens, blacklistedTokens, fungibleAssets } = base

  if (!tokensAndOwners && !tokens && chain !== 'solana') {
    tokens = defaultTokens[chain]
    if (!tokens) tokens = [nullAddress]
  }

  if (!blacklistedTokens) blacklistedTokens = []
  if (wrappedTokens && wrappedTokens.length) blacklistedTokens.push(...wrappedTokens)

  const options = { ...base, owners, tokens, chain, blacklistedTokens, permitFailure: true } // while filling historical data, some tokens may not exist on the chain yet, so we permit failure

  if (binanceTokensOnChain && binanceTokensOnChain.length) {
    if (!options.tokens) options.tokens = []
    options.tokens.push(...binanceTokensOnChain)
  }

  if (chain === 'ton') options.onlyWhitelistedTokens = true
  if (chain === 'aptos' && Array.isArray(fungibleAssets)) options.fungibleAssets = fungibleAssets
  if (chain === 'solana') {
    options.solOwners = owners
    if (!options.blacklistedTokens) options.blacklistedTokens = []

    options.onlyTrustedTokens = true
    options.blacklistedTokens.push('rTCAfDDrTAiP2hxBdfRtqnVZ9SF9E9JaQn617oStvPF')
  }

  return options
}

const tvl = async (api) => {
  const chain = api.chain.toLowerCase()
  const networks = chainToNetworks[chain]

  const [data, lockInfoData] = await Promise.all([
    getConfig('binance-cex/all-assets', ENDPOINT),
    getConfig('binance-cex/lock-info', LOCK_INFO_ENDPOINT),
  ])

  const contracts = data.data
    .filter(({ network }) => networks.includes(network.toUpperCase()))
    .map(({ address }) => address)
    .filter(Boolean)

  const evmChains = ['ethereum', 'bsc', 'celo', 'chz', 'polygon', 'arbitrum', 'arc', 'optimism', 'avax', 'fantom', 'base', 'era', 'manta', 'ronin', 'robinhood', 'op_bnb', 'scroll', 'sonic', 'plasma', 'klaytn','sei', 'kava', 'wc']
  const isEvm = evmChains.includes(chain)

  const lockInfoAddresses = []
  const wrappedTokens = []
  lockInfoData.tokens.forEach(token => {
    (token.lockInfo || []).forEach(li => {
      if (!networks.includes(li.network.toUpperCase())) return
      if (!li.address || /^[A-Z0-9]+-[A-Z0-9]+$/i.test(li.address)) return
      if (isEvm && (!/^0x[0-9a-fA-F]{40}$/.test(li.address))) return
      lockInfoAddresses.push(li.address)
    });
    (token.wrapInfo || []).forEach(wi => {
      if (!networks.includes(wi.network.toUpperCase())) return
      if (!wi.address || /^[A-Z0-9]+-[A-Z0-9]+$/i.test(wi.address)) return
      if (isEvm && (!/^0x[0-9a-fA-F]{40}$/.test(wi.address))) return
      wrappedTokens.push(wi.address)
    })
  })

  const owners = [...new Set([...contracts, ...lockInfoAddresses])]

  const binanceTokensOnChain = await getCEXTokensOnBinanceOnChain(chain)
  const options = buildConfig(chain, owners, binanceTokensOnChain, wrappedTokens)

  return await sumTokensExport(options)(api)
}

const chainExports = {}
const chains = new Set(Object.values(binanceToDefillama))
chains.forEach((chain) => { chainExports[chain] = { tvl } })

const ethStakedExport = { ethereum: { tvl: getStakedEthTVL({ withdrawalAddresses, size: 200, sleepTime: 20_000, proxy: true }) } }

module.exports = mergeExports([chainExports, ethStakedExport])
module.exports.methodology = 'All assets in wallets mentioned in Binance PoR api & wallets holding backing of binance pegged tokens are included in the tvl. We are not counting the Binance Recovery Fund wallet. On Ethereum, we also include staked ETH tracked via known withdrawal addresses.'

module.exports.bitcoin = { tvl: bitcoinTvl }

async function bitcoinTvl(api) {
  return sumTokens({ api, owners: await bitcoinAddressBook.binanceFetcher() })
}
