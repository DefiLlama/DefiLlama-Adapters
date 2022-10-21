const file = './cache.json'
const cache = require(file)
const fs = require('fs')
const path = require('path')
const { fixBalancesTokens, transformTokens, } = require('../tokenMapping.js')
const { get } = require('../http.js')
const { getAssetInfo } = require('../algorand')
const { providers } = require('@defillama/sdk/build/general')
const { log } = require('../utils')
const sdk = require('@defillama/sdk')

const evmChainsSupported = Object.keys(providers)
const chains = ['tezos', 'solana', 'algorand', ...evmChainsSupported]

async function getCoins() {
  return get('https://api.coingecko.com/api/v3/coins/list?include_platform=true')
}

const coinGeckoMapping = {
  "tezos": "tezos",
  "solana": "solana",
  "algorand": "algorand",
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
  // "godwoken": "godwoken",
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

const blacklistedTokens = {
  ethereum: [
    '0x23581767a106ae21c074b2276d25e5c3e136a68b',
    '0x1c5b760f133220855340003b43cc9113ec494823',
    '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a',
    '0x84119cb33e8f590d75c2d6ea4e6b0741a7494eda',
    '0x5e3845a1d78db544613edbe43dc1ea497266d3b8',
    '0xbdeb4b83251fb146687fa19d1c660f99411eefe3',
    '0xc19b6a4ac7c7cc24459f08984bbd09664af17bd1',
    '0xa00744882684c3e4747faefd68d283ea44099d03',
  ],
  bsc: [
    '0x3e3b357061103dc040759ac7dceeaba9901043ad',
    '0xf3db5668ed45562af38e362c19251ce256860c67',
  ],
  polygon: [
    '0xf4bb0ed25ac7bcc9c327b88bac5ca288a08ec41e',
  ],
  moonbeam: [
    '0x5c2da48241d3be9626dd0c48081c76dbb6d1046e',
  ],
  curio: [
    '0x2b4e4899b53e8b7958c4591a6d02f9c0b5c50f8f',
  ],
  energi: [
    '0x709adadd7ba01655ec684c9a74074ec70b023fe9',
    '0x04cb6ed1d4cef27b2b0d42d628f57ee223d6beee',
    '0xe19ab0a7f5bf5b243e011bd070cf9e26296f7ebc',
    '0x8476d1c07cbc7e2dd9e97ffbd9850836835ee7a8',
    '0x1cca61099dcebe517f8cac58f27218e7aff2d3bf',
    '0x8b8e6090542b612b7e2d73a934f9f5ea7e9a40af',
    '0xc588d81d1a9ef1a119446482fc7cbcdb0012292a',
    '0x8dc6bb6ec3caddefb16b0317fa91217a7df93000',
    '0x458a9f6a008055fd79f321ea7eb3f83a6cb326e2',
    '0xc59a4b20ea0f8a7e6e216e7f1b070247520a4514',
    '0xeeaccbb6ce1b5be68a2cf9d0dea27d4b807848d2',
    '0x9caa73156981600f4d276a10f80970a171abc1d1',
    '0xb506a79b296b78965f0a5c15e1474b026c23d9fa',
    '0x9594e7431144e80178b1bc6849edcba7d2d5bb27',
    '0x87ce5dde0595d9306db44dc0baa9703ace18c415',
    '0xf653d401a6af0ec568183d9d0714e3c5e61691d2',
    '0x8b2ed0247a3fd9706ac033dd7e926161e5c4753b',
  ],
  fusion: [
    '0xed0294dbd2a0e52a09c3f38a09f6e03de2c44fcf',
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  ],
}

async function update() {
  const allCoins = await getCoins()

  printCoingeckoInfo(allCoins)

  for (const chain of chains) {
    cCache = cache[chain] || {}
    const gechoChains = [coinGeckoMapping[chain]].flat()
    if (!gechoChains.length) continue;
    const knownAddresses = getKnownIds(chain)
    const geckoIds = getGeckoIds(chain)
    const calls = []
    let chainListUpdated = false

    for (const gChain of gechoChains) {
      let coins = allCoins.filter(i => i.platforms[gChain] && !geckoIds.has(i.id) && !knownAddresses.has(i.platforms[gChain]))
      const missingIds = coins.filter(i => i.platforms[gChain] === '').map(({ platforms, ...rest }) => rest)
      if (missingIds.length) {
        console.log('Missing ids: ', chain, gChain)
        console.table(missingIds)
      }

      coins = coins.filter(i => i.platforms[gChain] !== '' && !(blacklistedTokens[chain] || []).includes(i.platforms[gChain]))
      if (coins.length) chainListUpdated = true
      for (const { platforms: { [gChain]: key }, id } of coins) {
        cCache[key] = { decimals: 0, coingeckoId: id }
        if (evmChainsSupported.includes(chain)) {
          if (!key.startsWith('0x')) {
            console.log('Bad key', key, chain, gChain)
            delete cCache[key];
            continue;
          }
          calls.push({ target: key })
          cCache[key].decimals = 18
          continue;
        }
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
    }
    if (calls.length) log('fetching decimals for ', chain, gechoChains, calls.length)
    const { output: decimals } = await sdk.api.abi.multiCall({
      abi: 'erc20:decimals', calls, chain,
    })

    decimals.forEach(({ input: { target }, output }) => {
      if (output === null) {
        delete cCache[target]
        return;
      }
      cCache[target].decimals = +output
    })

    cache[chain] = cCache
    if (chainListUpdated)
      fs.writeFileSync(path.join(__dirname, file), JSON.stringify(cache))
  }
}

function printCoingeckoInfo(coins) {
  log('\n\ntotal number of coins in coingecko: ', coins.length)
  const sPlatforms = new Set()
  coins.forEach(({ platforms = {} }) => Object.entries(platforms).filter(([_, val]) => val !== '').forEach(([i]) => sPlatforms.add(i)))
  let platforms = [...sPlatforms]
  log('\n\nchains with addresses by coingecko', platforms.length, platforms.join(', '))

  log('\n\nchains supported by defillama', evmChainsSupported.length, evmChainsSupported.join(', '))

  const llamaGeckoIds = Object.values(coinGeckoMapping).flat()
  const chainsMissingMapping = evmChainsSupported.filter(i => !coinGeckoMapping[i])
  const platformsWithoutMapping = platforms.filter(i => !llamaGeckoIds.includes(i))
  log('\n\nEVM compatible chains on defillama without coingecko platform mapping: ', chainsMissingMapping.length, chainsMissingMapping.join(', '))
  log('\n\ncoingecko platform without token mapping: ', platformsWithoutMapping.length, platformsWithoutMapping.join(', '))
  log('\n\n')
}

function getKnownIds(chain) {
  const res = new Set()
  for (const key of Object.keys(fixBalancesTokens[chain] || {}))
    res.add(key)
  for (const key of Object.keys(transformTokens[chain] || {}))
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