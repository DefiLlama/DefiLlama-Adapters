const {
  addRaw,
  addToApi,
} = require('../helper/rujira/balances')
const {
  getFinConfig,
  getFinOrders,
  semverAtLeast,
} = require('../helper/rujira/fin')
const { getBlock, getContracts } = require('../helper/rujira/query')

async function tvl(api) {
  const height = await getBlock(api)
  const balances = {}
  const contracts = (await getContracts(height, 'rujira-fin')).filter(({ version }) =>
    semverAtLeast(version, '1.1.0'),
  )

  await Promise.all(
    contracts.map(async ({ address, version }) => {
      const { denoms, market_makers: marketMakers } = await getFinConfig(address, height)
      const orders = await getFinOrders(address, height, version, marketMakers)
      const excludedOwners = new Set(marketMakers)

      for (const order of orders) {
        // Oracle-priced orders are FIN's explicit Tracking Order representation.
        // Fixed-price user orders are ordinary orderbook escrow and stay excluded.
        if (!order || typeof order !== 'object')
          throw new Error(`Invalid FIN order for ${address} at ${height}`)
        if (excludedOwners.has(order.owner)) continue
        if (!order.price || !Object.prototype.hasOwnProperty.call(order.price, 'oracle'))
          continue
        if (!['base', 'quote'].includes(order.side) || order.remaining == null || order.filled == null)
          throw new Error(`Incomplete oracle FIN order for ${address} at ${height}`)
        const offeredDenom = order.side === 'base' ? denoms[0] : denoms[1]
        const purchasedDenom = order.side === 'base' ? denoms[1] : denoms[0]
        addRaw(balances, offeredDenom, order.remaining)
        addRaw(balances, purchasedDenom, order.filled)
      }
    }),
  )

  addToApi(api, balances)
}

module.exports = {
  methodology:
    'Counts only oracle-priced FIN Tracking Orders: remaining offered assets for open or partially filled orders and filled purchased assets still awaiting claim. Fixed orders and removed claimed or cancelled orders are excluded.',
  thorchain: { tvl },
}
