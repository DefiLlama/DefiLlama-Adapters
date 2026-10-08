const { GraphQLClient } = require("graphql-request");
const { getConfig } = require("../helper/cache");
const { sliceIntoChunks } = require("../helper/utils");

const graphQLClient = new GraphQLClient("https://api.mainnet.aptoslabs.com/v1/graphql");
const FA_BALANCES_QUERY = `query ThalaswapV2PoolBalances($addresses: [String!]!, $limit: Int!, $offset: Int!) {
  current_fungible_asset_balances(where: { owner_address: { _in: $addresses } }, order_by: { storage_id: asc }, limit: $limit, offset: $offset) {
    amount
    asset_type
  }
}`

const tvl = async (api) => {
  const { data: poolsData } = await getConfig('thalaswa-v2', 'https://app.thala.fi/api/liquidity-pools');
  const pools = poolsData.filter(pool => pool.metadata.isV2).map(pool => pool.metadata.lptAddress)
  const lpTokens = new Set(pools)

  // pool assets sit in fungible stores owned by the pool object (address == LP token address); read them from the
  // indexer instead of one rate-limited lens view call per pool. the indexer truncates large responses, so paginate
  const limit = 100
  for (const chunk of sliceIntoChunks(pools, 50)) {
    for (let offset = 0; ; offset += limit) {
      const { current_fungible_asset_balances: rows } = await graphQLClient.request(FA_BALANCES_QUERY, { addresses: chunk, limit, offset })
      rows.forEach(({ amount, asset_type }) => {
        if (!lpTokens.has(asset_type)) api.add(asset_type, amount)
      })
      if (rows.length < limit) break
    }
  }
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology: "Aggregates TVL in all pools in Thalaswap, Thala Labs' AMM.",
  aptos: { tvl }
}
