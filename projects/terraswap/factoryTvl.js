const { queryContract, queryContracts, sumTokens } = require('../helper/chain/cosmos')
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
  do {
    const queryStr = `{"pairs": { "limit": 30 ${allPairs.length ? `,"start_after":${JSON.stringify(allPairs[allPairs.length - 1].asset_infos)}` : ""} }}`
    currentPairs = (await queryContract({ contract: factory, chain, data: queryStr })).pairs
    allPairs.push(...currentPairs)
  } while (currentPairs.length > 0)
  const dtos = []
  const getPairPool = (async (pair) => {
    const pairRes = await queryContract({ contract: pair.contract_addr, chain, data: { pool: {} } })
    const pairDto = {}
    pairDto.assets = []
    pairDto.addr = pair.contract_addr
    pairRes.assets.forEach((asset, idx) => {
      const [addr, balance] = getAssetInfo(asset)
      pairDto.assets.push({ addr, balance })
    })
    dtos.push(pairDto)
  })
  await PromisePool
    .withConcurrency(25)
    .for(allPairs)
    .process(getPairPool)
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
  return async (_, _1, _2, { api }) => {
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
