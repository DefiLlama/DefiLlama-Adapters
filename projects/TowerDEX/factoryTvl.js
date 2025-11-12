const {queryContract, queryContractWithRetries} = require('../helper/chain/cosmos')
const {PromisePool} = require('@supercharge/promise-pool')
const {transformDexBalances} = require('../helper/portedTokens')

function extractTokenInfo(asset) {
  const {native_token, token, native} = asset.info
  for (const tObject of [native_token, token, native]) {
    if (!tObject) continue
    if (typeof tObject === 'string') return tObject
    const token = tObject.denom || tObject.contract_addr
    if (token) return token
  }
}

function getAssetInfo(asset) {
  return [extractTokenInfo(asset), Number(asset.amount)]
}

async function getAllPairs(factory, chain, {blacklistedPairs = []} = {}) {
  const blacklist = new Set(blacklistedPairs)
  let allPairs = []
  let currentPairs;
  const limit = 30
  do {
    const queryStr = `{"pairs": { "limit": ${limit} ${allPairs.length ? `,"start_after":${JSON.stringify(allPairs[allPairs.length - 1].contract_addr)}` : ""} }}`
    currentPairs = (await queryContract({contract: factory, chain, data: queryStr}))
    allPairs.push(...currentPairs.filter(pair => !blacklist.has(pair.contract_addr)))
  } while (currentPairs.length > 0)
  const dtos = []
  const getPairPool = (async (pair) => {
    const pairRes = await queryContractWithRetries({contract: pair.contract_addr, chain, data: {pool: {}}})
    const pairDto = {}
    pairDto.assets = []
    pairDto.addr = pair.contract_addr
    pairRes.assets.forEach((asset, idx) => {
      const [addr, balance] = getAssetInfo(asset)
      pairDto.assets.push({addr, balance})
    })
    pairDto.pair_type = pair.pair_type
    dtos.push(pairDto)
  })
  const {errors} = await PromisePool
    .withConcurrency(10)
    .for(allPairs)
    .process(getPairPool)
  if ((errors?.length ?? 0) > 50) {
    throw new Error(`Too many errors: ${errors.length}/${allPairs.length} on ${chain}`)
  }
  return dtos
}

const isNotXYK = (pair) => pair.pair_type && pair.pair_type.concentrated

function getFactoryTvl(factory, {blacklistedPairs = []} = {}) {
  return async (api) => {
    const pairs = (await getAllPairs(factory, api.chain, {blacklistedPairs})).filter(pair => (pair.assets[0].balance && pair.assets[1].balance))

    const otherPairs = pairs.filter(isNotXYK)
    const xykPairs = pairs.filter(pair => !isNotXYK(pair))
    otherPairs.forEach(({assets}) => {
      api.add(assets[0].addr, assets[0].balance)
      api.add(assets[1].addr, assets[1].balance)
    })
    const data = xykPairs.map(({assets}) => ({
      token0: assets[0].addr,
      token0Bal: assets[0].balance,
      token1: assets[1].addr,
      token1Bal: assets[1].balance,
    }))
    return transformDexBalances({api, data})
  }
}

module.exports = {
  getFactoryTvl,
}
