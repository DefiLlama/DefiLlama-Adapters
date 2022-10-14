const file = './cache.json'
const cache = require(file)
const fs = require('fs')
const path = require('path')
const { fixBalancesTokens, transformTokens, } = require('../tokenMapping.js')
const { get } = require('../http.js')
const { getAssetInfo } = require('../algorand')
const { providers } = require('@defillama/sdk/build/general')
const { log } = require('../utils')

const chains = ['tezos', 'solana', 'algorand']

async function getCoins() {
  return get('https://api.coingecko.com/api/v3/coins/list?include_platform=true')
}

const coinGeckoMapping = {
  "ethereum": "ethereum",
  "bsc": ["binance-smart-chain", "binancecoin",],
  "polygon": "polygon-pos",
  "heco": "huobi-token",
  "fantom": "fantom",
  "rsk": "rootstock",
  "tomochain": "tomochain",
  "xdai": "xdai",
  "avax": "avalanche",
  "wan": "wanchain",
  "harmony": "harmony-shard-0",
  "thundercore": "thundercore",
  "okexchain": "okex-chain",
  "optimism": "optimistic-ethereum",
  "arbitrum": "arbitrum-one",
  "kcc": "kucoin-community-chain",
  "celo": "celo",
  "iotex": "iotex",
  "moonriver": "moonriver",
  "shiden": "shiden network",
  "energi": "energi",
  "songbird": "songbird",
  "gochain": "gochain",
  "ethereumclassic": "ethereum-classic",
  "kardia": "kardiachain",
  "fuse": "fuse",
  "smartbch": "smartbch",
  "elastos": "elastos",
  "hoo": ["hoo", "hoo-smart-chain"],
  "fusion": "fusion-network",
  "aurora": "aurora",
  "ronin": "ronin",
  "boba": "boba",
  "cronos": "cronos",
  "telos": "telos",
  "metis": "metis-andromeda",
  "velas": "velas",
  "klaytn": "klay-token",
  "meter": "meter",
  "theta": "theta",
  "oasis": "oasis",
  "syscoin": "syscoin",
  "moonbeam": "moonbeam",
  "curio": "skale",
  "astar": "astar",
  "godwoken_v1": "godwoken",
  "godwoken": "godwoken",
  "evmos": "evmos",
  "conflux": "conflux",
  "milkomeda": "milkomeda-cardano",
  "dfk": "defi-kingdoms-blockchain",
  "findora": "findora",
  "echelon": "echelon",
  "kava": "kava",
  "sx": "sx-network",
  "karura_evm": "karura",
  "bitgert": "bitgert",
  "canto": "canto",
  "dogechain": "dogechain",
  "arbitrum_nova": "arbitrum-nova",
  "ethpow": "ethereumpow",
  "cube": "cube",
  "step": "step-network",
}

async function update() {
  const allCoins = await getCoins()
  printCoingeckoInfo(allCoins)
  for (const chain of chains) {
    cCache = cache[chain] || {}
    const knownAddresses = getKnownIds(chain)
    const geckoIds = getGeckoIds(chain)
    let coins = allCoins.filter(i => i.platforms[chain] && !geckoIds.has(i.id) && !knownAddresses.has(i.platforms[chain]))
    const missingIds = coins.filter(i => i.platforms[chain] === '').map(({ platforms, ...rest }) => rest)
    if (missingIds.length) {
      console.log('Missing ids')
      console.table(missingIds)
    }

    coins = coins.filter(i => i.platforms[chain] !== '')
    for (const { platforms: { [chain]: key }, id } of coins) {
      cCache[key] = { decimals: 0, coingeckoId: id }
      switch (chain) {
        case 'solana': break;
        case 'algorand':
          cCache[key].decimals = (await getAssetInfo(+key)).decimals;
          console.log('Adding algorand entry', key, cCache[key])
          break;
        case 'tezos':
        default: console.log(`${chain} Find decimals for ${key}`)
      }
    }
    cache[chain] = cCache
  }


  fs.writeFileSync(path.join(__dirname, file), JSON.stringify(cache))
}

function printCoingeckoInfo(coins) {
  log('\n\ntotal number of coins in coingecko: ', coins.length)
  const sPlatforms = new Set()
  coins.forEach(({ platforms = {} }) => Object.entries(platforms).filter(([_, val]) => val !== '').forEach(([i]) => sPlatforms.add(i)))
  let platforms = [...sPlatforms]
  log('\n\nchains with addresses by coingecko', platforms.length, platforms.join(', '))

  const chainsSuported = Object.keys(providers)
  log('\n\nchains supported by defillama', chainsSuported.length, chainsSuported.join(', '))
  const allChains = [...chains, ...chainsSuported]

  const llamaGeckoIds = Object.values(coinGeckoMapping).flat()
  const chainsMissingMapping = chainsSuported.filter(i => !coinGeckoMapping[i])
  const platformsWithoutMapping = platforms.filter(i => !llamaGeckoIds.includes(i))
  log('\n\nEVM compatible chains on defillama without coingecko platform mapping: ', chainsMissingMapping.length, chainsMissingMapping.join(', '))
  log('\n\ncoingecko platform without token mapping: ', platformsWithoutMapping.length, platformsWithoutMapping.join(', '))
  log('\n\n')
}

function getKnownIds(chain) {
  const res = new Set()
  for (const key of Object.keys(fixBalancesTokens[chain] || {}))
    res.add(key)
  return res
}

function getGeckoIds(chain) {
  const res = new Set()
  for (const key of Object.values(fixBalancesTokens[chain] || {}).map(i => i.coingeckoId))
    res.add(key)
  return res
}


update().then(() => console.log('Done!'))