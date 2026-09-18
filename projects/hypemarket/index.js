const sdk = require('@defillama/sdk')
const { getResourceData } = require('../helper/chain/supra')
const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

const CONTRACT = '0xbe08b388cc1a21ba8d8a514c1857369f4908d4b478bb8d66a369bfb9ca5a2da8'
const MARKETS_URL = 'https://api.hypemarket.trade/api/markets'

async function fetchAllMarketAddresses() {
  return getConfig('hypemarket', null, {
    fetcher: async () => {
      const addresses = []
      let page = 1
      while (true) {
        const res = await get(`${MARKETS_URL}?limit=100&page=${page}`)
        const items = res?.data?.items || []
        addresses.push(...items.map(i => i.market))
        if (items.length === 0 || addresses.length >= (res?.data?.total || 0) || page > 100) break
        page++
      }
      return addresses
    }
  })
}

async function tvl(api) {
  const markets = await fetchAllMarketAddresses()

  await sdk.util.runInPromisePool({
    items: markets,
    concurrency: 10,
    processor: async (address) => {
      const { collateral_amount, collateral_token } = await getResourceData(address, `${CONTRACT}::market::MarketData`)
      if(!collateral_amount || !collateral_token) throw new Error('Missing market data')
      if(collateral_amount > 0) api.add(collateral_token, collateral_amount)
    },
  })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the sum of on-chain collateral_amount across every Hypemarket market object on Supra',
  supra: { tvl },
}
