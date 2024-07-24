const { queryContract, queryContracts, sumTokens, queryContractWithRetries } = require('../helper/chain/cosmos')
const { PromisePool } = require('@supercharge/promise-pool')
const { transformDexBalances } = require('../helper/portedTokens')

function extractTokenInfo(asset) {
  const { native_token, token, native } = asset.info
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

async function getAllPairs(factory, chain) {
  let allPairs = []
  let currentPairs;
  const limit = factory === 'terra14x9fr055x5hvr48hzy2t4q7kvjvfttsvxusa4xsdcy702mnzsvuqprer8r' ? 29 : 30 // some weird native token issue at one of the pagination query
  do {
    const queryStr = `{"pairs": { "limit": ${limit} ${allPairs.length ? `,"start_after":${JSON.stringify(allPairs[allPairs.length - 1].asset_infos)}` : ""} }}`
    currentPairs = (await queryContract({ contract: factory, chain, data: queryStr })).pairs
    allPairs.push(...currentPairs)
  } while (currentPairs.length > 0)
  const dtos = []
  const getPairPool = (async (pair) => {
    const pairRes = await queryContractWithRetries({ contract: pair.contract_addr, chain, data: { pool: {} } })
    const pairDto = {}
    pairDto.assets = []
    pairDto.addr = pair.contract_addr
    pairRes.assets.forEach((asset, idx) => {
      const [addr, balance] = getAssetInfo(asset)
      pairDto.assets.push({ addr, balance })
    })
    dtos.push(pairDto)
  })
  const {errors} = await PromisePool
    .withConcurrency(10)
    .for(allPairs)
    .process(getPairPool)
  if((errors?.length ?? 0) > 50){
    throw new Error(`Too many errors: ${errors.length}/${allPairs.length} on ${chain}`)
  }
  return dtos
}

function getFactoryTvl(factory) {
  return async (_, _1, _2, { chain }) => {
    const pairs = (await getAllPairs(factory, chain)).filter(pair => (pair.assets[0].balance && pair.assets[1].balance))

    const data = pairs.map(({ assets }) => ({
      token0: assets[0].addr,
      token0Bal: assets[0].balance,
      token1: assets[1].addr,
      token1Bal: assets[1].balance,
    }))
    return transformDexBalances({ chain, data })
  }
}


function getSeiDexTvl(codeId) {
  return async (api) => {
    const chain = api.chain
    const contracts = await queryContracts({ chain, codeId, })
    return sumTokens({ chain, owners: contracts })
  }
}

module.exports = {
  getFactoryTvl,
  getSeiDexTvl,
  getAssetInfo,
}
