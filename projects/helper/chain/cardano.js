const sdk = require('@defillama/sdk')
const { post } = require('../http')
const { getAssets } = require('./cardano/blockfrost')
const { PromisePool } = require('@supercharge/promise-pool')

async function getAda(address) {
  const amount = await getAssets(address)
  return amount.find(i => i.unit === 'lovelace')?.quantity ?? 0
}

async function getAdaInAddress(address) {
  return (await getAda(address)) / 1e6
}

async function getTokenBalance(token, owner) {
  const assets = await getAssets(owner)
  return assets.find(i => i.unit === token)?.quantity ?? 0
}

async function sumTokens({ owners, balances = {} }) {

  const { results, errors } = await PromisePool.withConcurrency(4)
    .for(owners)
    .process(getAda)

  if (errors && errors.length)
    throw errors[0]

  for (const balance of results)
    sdk.util.sumSingleBalance(balances, 'cardano', balance / 1e6)
  return balances
}

async function getTokenPrice(address) {
  const endpoint = 'https://monorepo-mainnet-prod.minswap.org/graphql?TopPools'
  const { data: { topPools: [pool] } } = await post(endpoint, {
    "query": "query TopPools($asset: String, $favoriteLps: [InputAsset!], $limit: Int, $offset: Int, $sortBy: TopPoolsSortInput) {  topPools(    asset: $asset    favoriteLps: $favoriteLps    limit: $limit    offset: $offset    sortBy: $sortBy  ) {    assetA {      currencySymbol      tokenName      ...allMetadata    }    assetB {      currencySymbol      tokenName      ...allMetadata    }    reserveA    reserveB    lpAsset {      currencySymbol      tokenName    }    totalLiquidity    reserveADA }}        fragment allMetadata on Asset {  metadata {    name    ticker  decimals  }}",
    "variables": {
      "asset": address,
      "offset": 0,
      "limit": 20,
      "sortBy": {
        "column": "TVL",
        "type": "DESC"
      }
    }
  })
  if (pool.assetA.metadata) throw new Error('It is not paired against cardano')
  if (+pool.reserveA < 1e9) return 0 // less than 1000 ADA in pool, return price as 0
  return pool.reserveA / pool.reserveB // price in cardano
}

module.exports = {
  getAdaInAddress,
  sumTokens,
  getTokenBalance,
  getTokenPrice,
}