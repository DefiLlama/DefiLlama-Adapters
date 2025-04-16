const { queryEventsByType, getObjects, } = require('../helper/chain/sui')

async function tvl(api) {
  const eventType = '0xb61e324fa43746f5c24b2db3362afb382b644b32bce39a53f1f796a0109828e0::suimarket::EventCreated'
  let events = await queryEventsByType({ eventType, transform: i => i.event_id })
  events = await getObjects(events)

  events.forEach(object => {
    const coin = object.type.split('<')[1].replace('>', '')
    const amount = object.fields.total_base_coin
    api.add(coin, amount)
  })
}

module.exports = {
  // deadFrom: '2025-04-01',
  timetravel: false,
  sui: {
    tvl
  },
}
