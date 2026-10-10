const { post } = require('../helper/http')
const ADDRESSES = require('../helper/coreAssets.json')

const GATEWAY = 'https://mainnet.radixdlt.com'
// JustLock Locker component (package_rdx1p4k2vlr6rejahqfdazv2qff7dl5d88dxkpechapfx77exgv96wu8mk, https://github.com/just-lock/locker)
const LOCKER = 'component_rdx1cpae8nqhyeu2pz6z89vwca8085xels52lhsfrutnvagxz53u3p4yvl'
const CORE = new Set(Object.values(ADDRESSES.radixdlt))

async function getFungibles(address) {
  const first = await post(`${GATEWAY}/state/entity/details`, { addresses: [address], aggregation_level: 'Global' })
  const at_ledger_state = { state_version: first.ledger_state.state_version }
  const items = [...first.items[0].fungible_resources.items]
  let cursor = first.items[0].fungible_resources.next_cursor
  while (cursor) {
    const page = await post(`${GATEWAY}/state/entity/page/fungibles/`, { address, cursor, aggregation_level: 'Global', at_ledger_state })
    items.push(...page.items)
    cursor = page.next_cursor
  }
  return items
}

async function getDetails(addresses, opt_ins) {
  const items = []
  for (let i = 0; i < addresses.length; i += 20)
    items.push(...(await post(`${GATEWAY}/state/entity/details`, { addresses: addresses.slice(i, i + 20), opt_ins })).items)
  return Object.fromEntries(items.map(i => [i.address, i]))
}

const getMeta = (item, key) => item.metadata?.items?.find(m => m.key === key)?.value?.typed?.value

// counts locked liquidity only: native pool units held by the locker, valued at their share of the pool's core-asset side
// (doubled for the paired token); pools without XRD/WETH are skipped, raw locked tokens and LP NFTs are not counted
async function tvl(api) {
  const locked = (await getFungibles(LOCKER)).filter(i => +i.amount > 0)
  const resources = await getDetails(locked.map(i => i.resource_address), { explicit_metadata: ['pool'] })

  const positions = []
  for (const { resource_address, amount } of locked) {
    const resource = resources[resource_address]
    const pool = getMeta(resource, 'pool')
    if (pool) positions.push({ pool, share: +amount / +resource.details.total_supply })
  }

  const pools = await getDetails([...new Set(positions.map(p => p.pool))])
  for (const { pool, share } of positions) {
    const vaults = pools[pool].fungible_resources.items
    const core = vaults.filter(v => CORE.has(v.resource_address))
    if (!core.length) continue
    const multiplier = vaults.length / core.length
    core.forEach(v => api.add(v.resource_address, +v.amount * share * multiplier))
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Liquidity pool units locked in the JustLock locker component, read from the Radix gateway and valued at the XRD/WETH side of each pool, doubled for the paired token.',
  radixdlt: { tvl },
}
