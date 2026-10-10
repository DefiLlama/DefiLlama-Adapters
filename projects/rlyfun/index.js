const { post } = require('../helper/http')
const ADDRESSES = require('../helper/coreAssets.json')

const GATEWAY = 'https://mainnet.radixdlt.com'
// EarlyPump component (pump_home); its `launches` store maps launch id -> (token, EarlyCurves bonding curve component)
const LAUNCHES_KVS = 'internal_keyvaluestore_rdx1krtyftm7ly5fcwj7p9n4ksan9atxcvwhdpg3mnuc42atsdtc5nyu3v'
const XRD = ADDRESSES.radixdlt.XRD

async function getCurveComponents(at_ledger_state) {
  const keys = []
  let cursor
  do {
    const page = await post(`${GATEWAY}/state/key-value-store/keys`, { key_value_store_address: LAUNCHES_KVS, cursor, at_ledger_state, limit_per_page: 100 })
    keys.push(...page.items.map(i => ({ key_hex: i.key.raw_hex })))
    cursor = page.next_cursor
  } while (cursor)

  const components = []
  for (let i = 0; i < keys.length; i += 100) {
    const { entries } = await post(`${GATEWAY}/state/key-value-store/data`, { key_value_store_address: LAUNCHES_KVS, keys: keys.slice(i, i + 100), at_ledger_state })
    entries.forEach(e => components.push(e.value.programmatic_json.fields[1].value))
  }
  return components
}

async function tvl(api) {
  const { ledger_state } = await post(`${GATEWAY}/status/gateway-status`, {})
  const at_ledger_state = { state_version: ledger_state.state_version }
  const components = await getCurveComponents(at_ledger_state)

  for (let i = 0; i < components.length; i += 20) {
    const { items } = await post(`${GATEWAY}/state/entity/details`, { addresses: components.slice(i, i + 20), aggregation_level: 'Global', at_ledger_state })
    for (const item of items) {
      const xrd = item.fungible_resources.items.find(f => f.resource_address === XRD)
      if (xrd) api.add(XRD, +xrd.amount)
    }
  }
}

module.exports = {
  timetravel: false,
  methodology: 'XRD held in every rly.fun bonding curve, read on-chain from the Radix gateway. Curves are listed from the launches registry of the EarlyPump component.',
  radixdlt: { tvl },
}
