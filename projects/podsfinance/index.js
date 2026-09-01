const { getConfig } = require("../helper/cache.js");
const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const constants = {
  ADDRESS_ZERO: ADDRESSES.null,
  OPTION_TYPE_PUT: 0,
  OPTION_TYPE_CALL: 1,
  EXPIRATION_START_FROM: 1605000000,
  polygon: {
    id: 137,
    subgraph: sdk.graph.modifyEndpoint('5yQETkt77T9htftwDSW4WJpoGkPH9KBQzQLzPnuyZ8ti')
  },
  ethereum: {
    id: 1,
    subgraph: sdk.graph.modifyEndpoint('9qiAuWa5ryYeTj1gLy9BGiiVkfgkXnsN25wkYQSfyaws')
  },
  arbitrum: {
    id: 42161,
    subgraph: sdk.graph.modifyEndpoint('5Qz4mWABKaCfr9uGnteAAwmWmBAyQtRDYgB3ydU556HX')
  }
};
const { EXPIRATION_START_FROM } = constants;
const {
  ADDRESS_ZERO,
  OPTION_TYPE_PUT,
} = constants
const { request, gql } = require('graphql-request')

const OptionFragment = gql`
  fragment OptionFragment on Option {
    id
    address
    type
    expiration
    underlyingAsset
    underlyingAssetDecimals
    strikeAsset
    strikeAssetDecimals
    strikePrice
  }
`

const PoolFragment = gql`
  fragment PoolFragment on Pool {
    id
    address
    tokenB
    tokenBDecimals
  }
`

const QuerySeries = gql`
  query option(
    $blacklisted: [Bytes!]!
    $optionTypes: [Int!]!
    $expiration: Int!
  ) {
    options(
      where: {
        id_not_in: $blacklisted
        type_in: $optionTypes
        expiration_gt: $expiration
      }
    ) {
      ...OptionFragment
      pool {
        ...PoolFragment
      }
    }
  }
  ${OptionFragment}
  ${PoolFragment}
`

async function getOptions (
  network,
  expiration = 0,
  optionTypes = [],
  blacklisted = []
) {
  if (!blacklisted.length) blacklisted.push(ADDRESS_ZERO)
  if (!optionTypes.length) optionTypes.push(OPTION_TYPE_PUT)

  const query = await request(network.subgraph, QuerySeries, {
    blacklisted: blacklisted.map(address => String(address).toLowerCase()),
    optionTypes,
    expiration
  })

  if (!query || !query.options) return []

  return query.options
}

async function getTVL(api) {
  const network = constants[api.chain]
  const options = await getConfig('podsfinance/' + api.chain, undefined, {
    fetcher: async () => {
      const data = await getOptions(network, EXPIRATION_START_FROM)
      return data.filter(i => i)
    }
  })
  const tokensAndOwners = []
  options
    .filter(
      (option) =>
        option.strikeAsset &&
        option.underlyingAsset &&
        option.address
    )
    .forEach((option) => tokensAndOwners.push(
      [option.strikeAsset, option.address],
      [option.underlyingAsset, option.address],
    ))

  options
    .filter((option) => option.pool && option.pool.address)
    .forEach((option) => tokensAndOwners.push([option.pool.tokenB, option.pool.address]))


  return api.sumTokens({ tokensAndOwners })
}
const __inl_queries = {
  getTVL,
};
const { getTVL: tvl } = __inl_queries;


module.exports = {
  ethereum: { tvl },
  polygon: { tvl },
  arbitrum: { tvl },
}
