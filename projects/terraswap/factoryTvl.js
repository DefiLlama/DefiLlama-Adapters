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

const MAX_START_AFTER_LEN = 1500

function assetInfoBytes(info) {
  return info.native_token?.denom ?? info.token?.contract_addr ?? info.native ?? ''
}

// shortest string that sorts strictly after `str` (bump the first bumpable ascii char and cut there)
function nextKeyAfter(str) {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    if (code < 0x7e) return str.slice(0, i) + String.fromCharCode(code + 1)
  }
  return str + '~'
}

// spam pairs with multi-KB denoms make the LCD GET url exceed its limit (414) when used as start_after,
// so replace them with a short synthetic bound that the factory orders right after the spam pair key.
// the factory pair key is the byte-sorted concat of the asset infos, so bumping the smaller one is enough.
function getStartAfter(pair) {
  const infos = pair.asset_infos
  if (JSON.stringify(infos).length <= MAX_START_AFTER_LEN) return infos
  const smallest = infos.map(assetInfoBytes).sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)))[0]
  return [{ native_token: { denom: nextKeyAfter(smallest) } }]
}

async function getAllPairs(factory, chain, { blacklistedPairs = [], extraPairs = [] } = {}) {
  const blacklist = new Set(blacklistedPairs)
  let allPairs = []
  let currentPairs;
  const limit = factory === 'terra14x9fr055x5hvr48hzy2t4q7kvjvfttsvxusa4xsdcy702mnzsvuqprer8r' ? 29 : 30 // some weird native token issue at one of the pagination query
  do {
    const queryStr = `{"pairs": { "limit": ${limit} ${allPairs.length ? `,"start_after":${JSON.stringify(getStartAfter(allPairs[allPairs.length - 1]))}` : ""} }}`
    currentPairs = (await queryContract({ contract: factory, chain, data: queryStr })).pairs
    allPairs.push(...currentPairs.filter(pair => !blacklist.has(pair.contract_addr)))
  } while (currentPairs.length > 0)
  const knownPairs = new Set(allPairs.map(pair => pair.contract_addr))
  allPairs.push(...extraPairs.filter(contract => !knownPairs.has(contract)).map(contract_addr => ({ contract_addr })))
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
    pairDto.pair_type = pair.pair_type
    dtos.push(pairDto)
  })
  const { errors } = await PromisePool
    .withConcurrency(10)
    .for(allPairs)
    .process(getPairPool)
  if ((errors?.length ?? 0) > 50) {
    throw new Error(`Too many errors: ${errors.length}/${allPairs.length} on ${chain}`)
  }
  return dtos
}

const isNotXYK = (pair) => pair.pair_type && pair.pair_type.custom === 'concentrated'

function getFactoryTvl(factory, { blacklistedPairs = [], extraPairs = [] } = {}) {
  return async (api) => {
    const pairs = (await getAllPairs(factory, api.chain, { blacklistedPairs, extraPairs })).filter(pair => (pair.assets[0]?.balance && pair.assets[1]?.balance))

    const otherPairs = pairs.filter(isNotXYK)
    const xykPairs = pairs.filter(pair => !isNotXYK(pair))
    otherPairs.forEach(({ assets }) => {
      api.add(assets[0].addr, assets[0].balance)
      api.add(assets[1].addr, assets[1].balance)
    })

    const data = xykPairs.map(({ assets }) => ({
      token0: assets[0].addr,
      token0Bal: assets[0].balance,
      token1: assets[1].addr,
      token1Bal: assets[1].balance,
    }))
    return transformDexBalances({ api, data })
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
