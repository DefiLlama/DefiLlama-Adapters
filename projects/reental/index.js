const { post } = require('../helper/http')
const ADDRESSES = require('../helper/coreAssets.json')

// Reental — tokenized real estate on Polygon.
// Token list, per-token price oracles and terminations come from Reental's production Ponder indexer;
// supplies and prices are read onchain at the requested block.
const PONDER = 'https://ponder-pro.reental.eu/graphql'
const TOKEN_FACTORY = '0xe9ca09264af0ca970aa1356e8989eae956bedc4d' // ReentalTokenFactory (indexed by the Ponder)

async function fetchAll(entity, fields) {
  const items = []
  let after = null
  do {
    const query = `{ ${entity}(limit: 1000${after ? `, after: "${after}"` : ''}) { items { ${fields} } pageInfo { hasNextPage endCursor } } }`
    const { data, errors } = await post(PONDER, { query })
    if (errors?.length) throw new Error(`Reental ponder: ${errors[0].message}`)
    items.push(...data[entity].items)
    after = data[entity].pageInfo.hasNextPage ? data[entity].pageInfo.endCursor : null
  } while (after)
  return items
}

async function tvl(api) {
  const ts = api.timestamp ?? Math.floor(Date.now() / 1000)
  const [tokens, crowdfundings, terminations] = await Promise.all([
    fetchAll('tokens', 'address factoryAddress createdAt'),
    fetchAll('crowdfundings', 'assetAddress assetOracle createdAt'),
    fetchAll('terminations', 'tokenAddress createdAt'),
  ])

  // A terminated token means the property was sold and holders were paid out; leftover supply is unclaimed, not an asset.
  const terminated = new Set(terminations.filter(t => +t.createdAt <= ts).map(t => t.tokenAddress.toLowerCase()))

  // Each property token has a Chainlink-style price feed (USD, set by Reental from the property valuation).
  // If a token was relisted, use the oracle of its latest crowdfunding.
  const oracleOf = {}
  crowdfundings
    .filter(c => +c.createdAt <= ts)
    .sort((a, b) => +a.createdAt - +b.createdAt)
    .forEach(c => { oracleOf[c.assetAddress.toLowerCase()] = c.assetOracle })

  const live = tokens
    .filter(t => t.factoryAddress?.toLowerCase() === TOKEN_FACTORY && +t.createdAt <= ts)
    .map(t => t.address.toLowerCase())
    .filter(t => !terminated.has(t) && oracleOf[t])
  const oracles = live.map(t => oracleOf[t])

  const [supplies, rounds, decimals] = await Promise.all([
    api.multiCall({ abi: 'erc20:totalSupply', calls: live, permitFailure: true }),
    api.multiCall({ abi: 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)', calls: oracles, permitFailure: true }),
    api.multiCall({ abi: 'uint8:decimals', calls: oracles, permitFailure: true }),
  ])

  live.forEach((_, i) => {
    if (!supplies[i] || !rounds[i] || decimals[i] == null) return
    const usdValue = (Number(supplies[i]) / 1e18) * (Number(rounds[i].answer) / 10 ** Number(decimals[i]))
    api.add(ADDRESSES.polygon.USDT, Math.round(usdValue * 1e6))
  })
}

module.exports = {
  misrepresentedTokens: true,
  start: '2023-05-31',
  methodology: 'Sum over all live Reental property tokens (created by the ReentalTokenFactory on Polygon) of onchain totalSupply multiplied by the token\'s own price oracle (latestRoundData, USD), as configured in its Reental crowdfunding contract. Tokens of properties that have been sold (terminated) are excluded. Token, oracle and termination lists come from Reental\'s public Ponder indexer.',
  polygon: { tvl },
}
