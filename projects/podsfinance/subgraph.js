const {
  ADDRESS_ZERO,
  OPTION_TYPE_PUT,
  NETWORK_POLYGON,
  NETWORK_MAINNET,
  EXPIRATION_START_FROM
} = require('./constants')

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

/**
 *
 * @param {NETWORK_MAINNET | NETWORK_POLYGON} network
 * @param {*} optionTypes
 * @param {*} blacklisted
 * @param {number} expiration
 */
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

module.exports = {
  getOptions
}
