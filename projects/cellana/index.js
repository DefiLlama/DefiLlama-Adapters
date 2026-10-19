const { GraphQLClient } = require("graphql-request");
const { function_view } = require("../helper/chain/aptos");
const { sliceIntoChunks } = require("../helper/utils");
const cellanaAddress = "0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1"

const graphQLClient = new GraphQLClient("https://api.mainnet.aptoslabs.com/v1/graphql");
const FA_BALANCES_QUERY = `query CellanaPoolBalances($addresses: [String!]!, $limit: Int!, $offset: Int!) {
  current_fungible_asset_balances(where: { owner_address: { _in: $addresses } }, order_by: { storage_id: asc }, limit: $limit, offset: $offset) {
    amount
    asset_type
  }
}`
const FA_CREATORS_QUERY = `query CellanaAssetCreators($assets: [String!]!) {
  fungible_asset_metadata(where: { asset_type: { _in: $assets } }) {
    asset_type
    creator_address
  }
}`

async function tvl(api) {
  const pools = await function_view({ functionStr: `${cellanaAddress}::liquidity_pool::all_pool_addresses`, type_arguments: [], args: [] })
  // pool reserves sit in fungible stores owned by the pool objects; one indexer query per 50 pools
  // instead of two rate-limited view calls per pool
  const balances = {}
  // the indexer silently truncates large responses (4 stores per pool), so page through each chunk
  const limit = 100
  for (const chunk of sliceIntoChunks(pools.map(p => p.inner), 50)) {
    for (let offset = 0; ; offset += limit) {
      const { current_fungible_asset_balances: rows } = await graphQLClient.request(FA_BALANCES_QUERY, { addresses: chunk, limit, offset })
      rows.forEach(({ amount, asset_type }) => {
        if (+amount > 0) balances[asset_type] = (balances[asset_type] ?? 0n) + BigInt(amount)
      })
      if (rows.length < limit) break
    }
  }
  // legacy coins are held as cellana coin_wrapper FAs; get_original maps them back to the priceable coin type.
  // only FAs created by the wrapper account need the lookup
  const wrapperAddress = await function_view({ functionStr: `${cellanaAddress}::coin_wrapper::wrapper_address` })
  const { fungible_asset_metadata: metadata } = await graphQLClient.request(FA_CREATORS_QUERY, { assets: Object.keys(balances) })
  const wrapped = new Set(metadata.filter(m => m.creator_address === wrapperAddress).map(m => m.asset_type))
  for (const [asset, amount] of Object.entries(balances)) {
    const token = wrapped.has(asset) ? await function_view({ functionStr: `${cellanaAddress}::coin_wrapper::get_original`, args: [asset] }) : asset
    api.add(token, amount.toString())
  }
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology:
    "Counts the tokens held in every Cellana liquidity pool.",
  aptos: {
    tvl,
  }
}
