const {
  addDecimal,
  addToApi,
} = require('../helper/rujira/balances')
const {
  getFinConfig,
  getFinRanges,
  semverAtLeast,
} = require('../helper/rujira/fin')
const { getBlock, getContracts } = require('../helper/rujira/query')

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

async function tvl(api) {
  const height = await getBlock(api)
  const balances = {}

  await addCclRanges(height, balances)
  addToApi(api, balances)
}

module.exports = {
  methodology:
    'Counts user-owned FIN CCL range principal plus separately accrued, unclaimed fees. The bRUNE contract\'s RUNE liquidity is excluded here because it is already counted by the bRUNE adapter (rujira-brune); ordinary FIN orders, unrelated market makers, and x/brune, AUTO, and xUSK range-token components are also excluded.',
  thorchain: { tvl },
}
