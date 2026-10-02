const sui = require("../helper/chain/sui")
const { fetchURL } = require('../helper/utils')
const { getConfig } = require('../helper/cache')

function getDecimalShifts(dynamicFields){
  return fetchURL(`https://coins.llama.fi/prices/current/${dynamicFields.map(c=>`sui:0x${c.fields.value.fields.coin_type}`).join(',')}`).then(r=>r.data.coins)
}

const NAVI_API = 'https://open-api.naviprotocol.io/api/navi'

// Storage objects of every NAVI lending market, so newly launched markets are picked up automatically
async function getStorageIds() {
  const storageIds = await getConfig('navi/storage-ids', undefined, {
    fetcher: async () => {
      const markets = await fetchURL(`${NAVI_API}/markets?env=prod`).then(r => r.data.data.markets)
      const configs = await Promise.all(markets.map(m => fetchURL(`${NAVI_API}/config?env=prod&market=${m.key}`).then(r => r.data.data)))
      const ids = configs.map(c => c.storage).filter(Boolean)
      if (!ids.length) throw new Error('navi: empty market config') // keeps the last cached list
      return ids
    },
  })
  if (!Array.isArray(storageIds) || !storageIds.length) throw new Error('navi: no market storage ids')
  return storageIds
}

async function getReserves() {
  const storageObjects = await sui.getObjects(await getStorageIds())
  const reserves = []
  for (const storageObject of storageObjects) {
    const reservesId = storageObject.fields.reserves.fields.id.id
    reserves.push(...await sui.getDynamicFieldObjects({ parent: reservesId }))
  }
  const decimals = await getDecimalShifts(reserves)
  return { reserves, decimals }
}

async function borrow(api) {
  const { reserves, decimals } = await getReserves()

  reserves.forEach((data) => {
    const coin = '0x' + data.fields.value.fields.coin_type
    const borrowed = data.fields.value.fields.borrow_balance.fields.total_supply * data.fields.value.fields.current_borrow_index / 1e27
    if(decimals["sui:"+coin]){
      const amount = borrowed * (10 ** (decimals["sui:"+coin].decimals - 9))
      api.add(coin, amount)
    }
  })
}


async function tvl(api) {
  const { reserves, decimals } = await getReserves()

  reserves.forEach(object => {
    const coin = '0x' + object.fields.value.fields.coin_type
    const total_supply = object.fields.value.fields.supply_balance.fields.total_supply * object.fields.value.fields.current_supply_index / 1e27
    const borrowed = object.fields.value.fields.borrow_balance.fields.total_supply * object.fields.value.fields.current_borrow_index / 1e27
    if(decimals["sui:"+coin]){
      const amount = (total_supply - borrowed) * (10 ** (decimals["sui:"+coin].decimals - 9))
      api.add(coin, amount)
    }
  })
}


module.exports = {
  timetravel: false,
  sui: {
    tvl,
    borrowed: borrow,
  },
}
