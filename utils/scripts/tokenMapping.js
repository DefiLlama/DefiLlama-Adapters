const fs = require('fs')
const { getUniqueAddresses, } = require('../../projects/helper/utils')
const cacheFile = '../../../server/coins/src/adapters/tokenMapping.json'
const coreAssetsFile = '../../projects/helper/coreAssets.json'
const sdk = require('@defillama/sdk')


const cache = require(cacheFile)
const coreAssets = require(coreAssetsFile)

const nullAddress = '0x0000000000000000000000000000000000000000'
const gasTokens = [
  nullAddress,
  "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
]

const transformTokens = {
}

const ibcMappings = {}

const fixBalancesTokens = {}

// run()

// function writeToCache() {
//   fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2))
//   fs.writeFileSync(coreAssetsFile, JSON.stringify(coreAssets, null, 2))
// }

function transformTo(address) {
  if (address.startsWith('0x')) return 'ethereum:' + address
  if (address.includes('0x')) return address
  return 'coingecko#' + address
}

async function run() {
  let promises = []
  Object.entries(transformTokens).forEach(([chain, obj]) => {
    cache[chain] = cache[chain] ?? {}
    if (!sdk.api.config.getProvider(chain)) {
      console.log('skipping because it is not evm: ', chain)
      const tokens = Object.keys(obj)
      cache[chain]
      tokens.forEach((token, i) => {
        // token = token.toLowerCase()
        cache[chain][token] = { name: "", decimals: "", symbol: "", to: transformTo(obj[token]) }
      })

      return;
    }
    gasTokens.forEach(token => {
      if (obj[token]) {
        console.log('skipping null token', token, chain)
        cache[chain][token] = { name: "", decimals: "", symbol: "", to: transformTo(obj[token]) }
        delete obj[token]
      }
    })

    promises.push(addChain())
    async function addChain() {

      const tokens = Object.keys(obj)
      const api = new sdk.ChainApi({ chain })
      const symbol = await api.multiCall({ abi: 'erc20:symbol', calls: tokens })
      const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })
      const name = await api.multiCall({ abi: 'string:name', calls: tokens })
      cache[chain] = cache[chain] ?? {}
      tokens.forEach((token, i) => {
        token = token.toLowerCase()
        cache[chain][token] = { name: name[i], decimals: decimals[i], symbol: symbol[i], to: transformTo(obj[tokens[i]]) }
      })
      let coreTokens = coreAssets[chain] ?? []
      coreTokens.push(...tokens)
      coreAssets[chain] = getUniqueAddresses(coreTokens)
    }
  })


  Object.entries(fixBalancesTokens).forEach(([chain, obj]) => {
    cache[chain] = cache[chain] ?? {}
    if (!sdk.api.config.getProvider(chain)) {
      console.log('skipping because it is not evm: ', chain)
      const tokens = Object.keys(obj)
      tokens.forEach((token, i) => {
        // token = token.toLowerCase()
        cache[chain][token] = { name: obj[token].coingeckoId, decimals: obj[token].decimals + "", symbol: "", to: transformTo(obj[token].coingeckoId) }
      })

      return;
    }
    gasTokens.forEach(token => {
      if (obj[token]) {
        console.log('skipping null token', token, chain)
        cache[chain][token] = { name: obj[token].coingeckoId, decimals: obj[token].decimals + "", symbol: "", to: transformTo(obj[token].coingeckoId) }
        delete obj[token]
      }
    })

    promises.push(addChain())


    async function addChain() {

      const tokens = Object.keys(obj)
      const api = new sdk.ChainApi({ chain })
      const symbol = await api.multiCall({ abi: 'erc20:symbol', calls: tokens })
      const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })
      const name = await api.multiCall({ abi: 'string:name', calls: tokens })

      tokens.forEach((token, i) => {
        token = token.toLowerCase()
        cache[chain][token] = { name: name[i], decimals: decimals[i], symbol: symbol[i], to: transformTo(obj[tokens[i]].coingeckoId) }
      })
      let coreTokens = coreAssets[chain] ?? []
      coreTokens.push(...tokens)
      coreAssets[chain] = getUniqueAddresses(coreTokens)
    }
  })



  Object.entries(ibcMappings).forEach(([token, { decimals, coingeckoId}]) => {
    const chain = 'ibc'
    cache[chain] = cache[chain] ?? {}
    cache[chain][token.replace('ibc/', '')] = { name: coingeckoId, decimals: decimals + "", symbol: "", to: transformTo(coingeckoId) }
  })

  await Promise.all(promises)
  // writeToCache()
}
