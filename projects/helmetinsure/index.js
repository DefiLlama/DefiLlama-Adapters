const ADDRESSES = require('../helper/coreAssets.json')
const { blockQuery } = require('../helper/http')
const sdk = require('@defillama/sdk')
const { gql } = require('graphql-request')
const CHAIN_POLYGON = 'polygon'
const CHAIN_BSC = 'bsc'

const THEGARPH_API = {
  [CHAIN_POLYGON]: "https://api.thegraph.com/subgraphs/name/app-helmet-insure/guard",
  [CHAIN_BSC]: "https://api.thegraph.com/subgraphs/name/app-helmet-insure/helmet-insure"
}

function transform(str) {
  switch (str) {
    case "bsc:0xaf90e457f4359adcc8b37e8df8a27a1ff4c3f561": // SHIB
      return ADDRESSES.ethereum.INU
    case "bsc:0xf218184af829cf2b0019f8e6f0b2423498a36983": // MATH
      return "0x08d967bb0134f2d07f7cfb6e246680c53927dd30"
    case "bsc:0xbd2949f67dcdc549c6ebe98696449fa79d988a9f":
      return "0xBd2949F67DcdC549c6Ebe98696449Fa79D988A9F"
    default:
      return str
  }
}

function fetch(chain) {
  return async (ts, _, chainBlocks, { api }) => {
    var endpoint = THEGARPH_API[chain]
    var query = gql`
    query tvl($block: Int){
      options(
        first: 1000,
        block: { number: $block }
      ) {
        collateral
        asks {
          volume
          settleToken
        }
      }
    }
    `;
    const results = await blockQuery(endpoint, query, { api, blockCatchupLimit: 2000, })
    const { options } = results

    const data = options.flatMap(o => {
      return o.asks.map(ask => {
        return Object.assign(ask, {
          collateral: o.collateral
        })
      })
    }).reduce((_data, ask) => {
      const key = transform(`${chain}:${ask.collateral}`)
      sdk.util.sumSingleBalance(_data, key, ask.volume)
      return _data
    }, {})
    return data
  }
}

module.exports = {
  [CHAIN_POLYGON]:{
    tvl: fetch(CHAIN_POLYGON)
  },
  [CHAIN_BSC]:{
    tvl: fetch(CHAIN_BSC)
  },
}