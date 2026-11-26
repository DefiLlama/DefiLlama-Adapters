const { formatUnits } = require('ethers')
const config = require('./config.json')

const MIGRATION_TIMESTAMP = 1795651200 // 2026-11-26 00:00 UTC
const PRICE_EVENT = 'event UpdateNowPrice(address indexed token, uint256 price, int256 timestamp, bytes32 feedId)'
const normalize = address => address.toLowerCase()

async function tvl(api) {
  if (api.timestamp < MIGRATION_TIMESTAMP) return {}

  const block = await api.getBlock()
  const header = await api.provider.getBlock(block)
  if (!header || header.timestamp < MIGRATION_TIMESTAMP) throw new Error('Jasper inventory: block predates migration')
  const owners = [...new Set(config.vaults.flatMap(vault => [vault.long, vault.short]).map(normalize))]
  const excluded = new Set(config.excludedTokens.map(normalize))
  const registered = await api.multiCall({
    target: config.manager,
    abi: 'function getVaultAllTokens(address) view returns (address[])',
    calls: owners.map(owner => ({ params: [owner] })),
  })
  const pairs = owners.flatMap((owner, index) => [...new Set([
    ...Object.keys(config.tokens), ...registered[index].map(normalize),
  ])].filter(token => !excluded.has(token)).map(token => ({ token, owner })))
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: pairs.map(({ token, owner }) => ({ target: token, params: [owner] })),
  })
  const totals = new Map()
  for (let index = 0; index < pairs.length; index++) {
    const balance = BigInt(balances[index])
    if (!balance) continue
    const { token } = pairs[index]
    if (!config.tokens[token]) throw new Error(`Jasper inventory: unmapped nonzero token ${token}`)
    totals.set(token, (totals.get(token) || 0n) + balance)
  }

  const tokens = [...totals.keys()]
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })
  for (let index = 0; index < tokens.length; index++) {
    if (Number(decimals[index]) !== config.tokens[tokens[index]].decimals)
      throw new Error(`Jasper inventory: unexpected decimals for ${tokens[index]}`)
  }

  const pricedTokens = new Set(tokens.filter(token => !config.tokens[token].usdPeg))
  const prices = new Map()
  if (pricedTokens.size) {
    const logs = await api.getLogs({
      target: config.oracle,
      eventAbi: PRICE_EVENT,
      parseLog: true,
      fromBlock: 1,
      toBlock: block,
      // Besu permits at most 10,000 blocks; leave room for the SDK's cache buffer.
      maxBlockRange: 9900,
      skipIndexer: true,
    })
    // Select by chain order, not API return order or the signed timestamp alone.
    for (const log of logs) {
      const token = normalize(log.args.token)
      if (!pricedTokens.has(token) || log.blockNumber > block || log.removed) continue
      const previous = prices.get(token)
      if (previous && (previous.block > log.blockNumber ||
        (previous.block === log.blockNumber && previous.index >= log.index))) continue
      const { price, timestamp, feedId } = log.args
      if (BigInt(price) <= 0n || BigInt(timestamp) <= 0n || BigInt(timestamp) > BigInt(header.timestamp) ||
        normalize(feedId) !== config.tokens[token].feedId)
        throw new Error(`Jasper inventory: invalid signed price for ${token}`)
      prices.set(token, { price: BigInt(price), timestamp: Number(timestamp), block: log.blockNumber, index: log.index })
    }
  }

  let total = 0n
  for (const [token, balance] of totals) {
    const entry = config.tokens[token]
    const price = entry.usdPeg ? 10n ** 18n : prices.get(token)?.price
    if (!price) throw new Error(`Jasper inventory: missing on-chain reference price for ${entry.symbol}`)
    total += balance * price / 10n ** BigInt(entry.decimals)
  }
  // Preserve integer arithmetic until this final conversion required by addUSDValue.
  const value = Number(formatUnits(total, 18))
  if (!Number.isFinite(value)) throw new Error('Jasper inventory: invalid aggregate value')
  api.log('Jasper inventory reference', {
    block,
    writers: owners.length,
    grossValueUSD: value,
    prices: [...prices].map(([token, price]) => ({
      symbol: config.tokens[token].symbol,
      priceUSD: formatUnits(price.price, 18),
      timestamp: price.timestamp,
      ageSeconds: header.timestamp - price.timestamp,
    })),
  })
  // addUSDValue represents the aggregate using the SDK's USD/USDT pricing proxy.
  api.addUSDValue(value)
}

module.exports = { tvl, MIGRATION_TIMESTAMP }
