const {
  addDecimal,
  addScaled,
  addToApi,
} = require('../rujira/balances')
const {
  getFinConfig,
  getFinRanges,
  semverAtLeast,
} = require('../rujira/fin')
const { getBruneBacking } = require('../rujira/helper')
const { getBlock, getContracts } = require('../rujira/query')

const CCL_ACTIVATION_BLOCK = 24_991_560
const EXCLUDED_DENOMS = new Set(['x/brune', 'thor.auto', 'thor.xusk'])

async function addCclRanges(height, balances) {
  if (height < CCL_ACTIVATION_BLOCK) return

  const contracts = (await getContracts(height, 'rujira-fin')).filter(({ version }) =>
    semverAtLeast(version, '1.2.0'),
  )

  await Promise.all(
    contracts.map(async ({ address, version }) => {
      const [{ denoms, market_makers: marketMakers }, ranges] = await Promise.all([
        getFinConfig(address, height),
        getFinRanges(address, height, version),
      ])
      const excludedOwners = new Set(marketMakers)
      for (const range of ranges) {
        if (excludedOwners.has(range.owner)) continue
        // FIN stores range principal and unclaimed range fees separately.
        if (!EXCLUDED_DENOMS.has(denoms[0])) {
          addDecimal(balances, denoms[0], range.base)
          addDecimal(balances, denoms[0], range.fees[0])
        }
        if (!EXCLUDED_DENOMS.has(denoms[1])) {
          addDecimal(balances, denoms[1], range.quote)
          addDecimal(balances, denoms[1], range.fees[1])
        }
      }
    }),
  )
}

async function addBruneMarketMaker(height, balances) {
  if (height < CCL_ACTIVATION_BLOCK) return

  const contracts = await getContracts(height, 'rujira-brune')
  for (const { address } of contracts) {
    const { liquid, bonded, minted, pendingRevenue } = await getBruneBacking(address, height)

    // This mirrors rujira-brune's quote_liquidity calculation. Pending
    // revenue and any surplus backing are not available to FIN bid quotes.
    const surplus = liquid + bonded > minted ? liquid + bonded - minted : 0n
    const unavailable = pendingRevenue > surplus ? pendingRevenue : surplus
    const quoteLiquidity = liquid > unavailable ? liquid - unavailable : 0n
    addScaled(balances, 'rune', quoteLiquidity)
  }
}

async function tvl(api) {
  const height = await getBlock(api)
  const balances = {}

  await Promise.all([
    addCclRanges(height, balances),
    addBruneMarketMaker(height, balances),
  ])
  addToApi(api, balances)
}

module.exports = {
  methodology:
    'Counts user-owned FIN CCL range principal plus separately accrued, unclaimed fees, together with the liquid RUNE that the bRUNE contract makes available to the bRUNE/RUNE FIN market. Virtual bRUNE minted on demand, ordinary FIN orders, unrelated market makers, and x/brune, AUTO, and xUSK range-token components are excluded.',
  thorchain: { tvl },
}
