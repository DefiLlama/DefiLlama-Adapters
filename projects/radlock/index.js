const { sumTokens, queryAddresses } = require('../helper/chain/radixdlt')
const { post } = require('../helper/http')
const { sliceIntoChunks } = require('../helper/utils')

// RadLock on-chain components (from app.radlock.io config)
const TOKEN_LOCK_SERVICE = 'component_rdx1crn49lcmzyuqpz4lgx8fulegk4pdzjz89lhegs4g5attrgxqjp4amc'
const TOKEN_VEST_SERVICE = 'component_rdx1cp7vsz98w06urq3n00rf9xz9jrlppyk0sukqrm4kvqvkjwucne6puh'

const ENTITY_DETAILS_URL = 'https://mainnet.radixdlt.com/state/entity/details'

async function tvl(api) {
  await sumTokens({ api, owners: [TOKEN_LOCK_SERVICE, TOKEN_VEST_SERVICE] })
  await unwrapPoolUnits(api)
}

// Locked native pool units (e.g. Defiplaza TwoResourcePool LP) -> pro-rata share of the pool's reserves
async function unwrapPoolUnits(api) {
  const balances = api.getBalances()
  const tokens = Object.keys(balances).filter(i => i.startsWith('radixdlt:resource_')).map(i => i.replace('radixdlt:', ''))
  if (!tokens.length) return

  const poolUnits = {} // pool address -> { lpToken, supply }
  for (const chunk of sliceIntoChunks(tokens, 20)) {
    const { items } = await post(ENTITY_DETAILS_URL, { addresses: chunk, opt_ins: { explicit_metadata: ['pool'] } })
    for (const item of items) {
      const pool = item.metadata?.items?.find(i => i.key === 'pool')?.value?.typed?.value
      if (typeof pool !== 'string' || !pool.startsWith('pool_')) continue
      poolUnits[pool] = { lpToken: item.address, supply: +item.details?.total_supply }
    }
  }

  const pools = Object.keys(poolUnits)
  if (!pools.length) return
  const poolDetails = await queryAddresses({ addresses: pools })
  for (const pool of poolDetails) {
    const { lpToken, supply } = poolUnits[pool.address]
    const key = `radixdlt:${lpToken}`
    const held = +balances[key]
    delete balances[key]
    if (!supply || !held) continue
    const ratio = held / supply
    pool.fungible_resources.items.forEach(({ resource_address, amount }) => {
      if (resource_address === lpToken) return
      api.add(resource_address, +amount * ratio)
    })
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Tokens held in the RadLock token lock and vesting components on Radix. Locked native pool units are unwrapped into the underlying pool reserves.',
  radixdlt: { tvl },
}
