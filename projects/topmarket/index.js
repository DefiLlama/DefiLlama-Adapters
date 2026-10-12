const { formatUnits } = require('ethers')
const { getLogs2 } = require('../helper/cache/getLogs')

const pool = '0xde16e61171ca80c169ecb82e9328118ae5958369'
// Pool proxy creation, not the public launch date.
const fromBlock = 50634768
const zeroAddress = '0x0000000000000000000000000000000000000000'

/**
 * Value deposited NFTs still in pool custody using the oracle at the requested block.
 * @param {object} api DefiLlama ChainApi for Base.
 * @returns {Promise<void>} Adds the aggregate USD appraisal to the API balances.
 */
async function tvl(api) {
  // Pin even current runs: logs, custody and valuation must use the same block.
  const toBlock = await api.getBlock()
  if (toBlock < fromBlock) return

  const logOptions = {
    api,
    target: pool,
    eventAbi: 'event Staked(address indexed collection, uint256 indexed tokenId, address indexed staker)',
    fromBlock,
    toBlock,
    onlyArgs: true,
    // Preserve the RPC-backed behavior used by the historical replay harness.
    useIndexer: false,
  }
  const logs = await getLogs2(logOptions)
  // The helper's cached path excludes toBlock and may reuse a cache one block behind.
  // Read that block without touching the historical cache; token deduplication below
  // also covers the overlap when a cold fetch already included it.
  logs.push(...await getLogs2({ ...logOptions, fromBlock: toBlock, skipCache: true }))
  // stakeFor also emits Staked. Re-staking a token must not count it twice.
  const tokens = [...new Map(logs.map(({ collection, tokenId }) => {
    collection = collection.toLowerCase()
    return [`${collection}:${tokenId}`, { collection, tokenId: tokenId.toString() }]
  })).values()]
  if (!tokens.length) return

  const stakers = await api.multiCall({
    target: pool,
    abi: 'function stakerOf(address,uint256) view returns (address)',
    calls: tokens.map(({ collection, tokenId }) => ({ params: [collection, tokenId] })),
  })
  const deposited = tokens.filter((_, i) => stakers[i].toLowerCase() !== zeroAddress)
  if (!deposited.length) return

  const owners = await api.multiCall({
    abi: 'function ownerOf(uint256) view returns (address)',
    calls: deposited.map(({ collection, tokenId }) => ({ target: collection, params: [tokenId] })),
  })
  const counts = {}
  deposited.forEach(({ collection }, i) => {
    // Picked/locked cards still belong to the pool, despite leaving its draw tree.
    // User wallets, Safe inventory still outside the pool and unsolicited transfers are not deposits.
    if (owners[i].toLowerCase() === pool)
      counts[collection] = (counts[collection] || 0n) + 1n
  })
  const collections = Object.keys(counts)
  if (!collections.length) return

  const oracle = await api.call({ target: pool, abi: 'address:priceOracle' })
  if (oracle.toLowerCase() === zeroAddress) throw new Error('TopMarket: missing price oracle')
  const decimals = Number(await api.call({ target: oracle, abi: 'uint8:priceDecimals' }))
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 36)
    throw new Error(`TopMarket: invalid price decimals ${decimals}`)
  const prices = await api.multiCall({
    target: oracle,
    abi: 'function priceOf(address,uint256) view returns (uint256 price, uint256 updatedAt)',
    // The current oracle prices collections and ignores tokenId.
    calls: collections.map(collection => ({ params: [collection, 0] })),
  })
  let total = 0n
  prices.forEach(([price, updatedAt], i) => {
    if (BigInt(price) <= 0n || BigInt(updatedAt) <= 0n)
      throw new Error(`TopMarket: invalid or missing oracle price for ${collections[i]}`)
    // No documented expiry policy: use the last published mark, without inventing a TTL.
    total += counts[collections[i]] * BigInt(price)
  })
  // SDK USD balances require a Number; convert only after exact integer aggregation.
  api.addUSDValue(Number(formatUnits(total, decimals)))
}

module.exports = {
  // NFT appraisal values are represented as USD, not a held fungible token balance.
  misrepresentedTokens: true,
  methodology: 'Counts unique NFTs deposited in the Base StakingPool with a nonzero staker and pool ownership at the requested block, including picked cards still in custody and deposits made by the Asset Safe. The Asset Safe may hold cards on behalf of users or business participants and may also hold platform-owned inventory; both are included once deposited into the pool. The history lower bound is the pool deployment block. Excludes NFTs still held by the Asset Safe outside the pool, user wallets and unsolicited transfers. Values each collection using the pool\'s PlatformPriceOracle and priceDecimals at the same block. These are platform-maintained manual USD appraisals submitted on-chain by authorized operators or the owner multisig, not independent market quotes. Uses the last published appraisal without an expiry rule; missing prices fail the calculation.',
  base: { tvl },
}
