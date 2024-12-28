const axios = require('axios')
const fs = require('fs')
const { sliceIntoChunks, sleep } = require('../../projects/helper/utils')
const cacheFile = '../../../coingeckoCache.json'
const geckoCache = require(cacheFile)

const api = {
  tokens: "https://api.coingecko.com/api/v3/coins/list",
  prices: ids => `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_last_updated_at=true`
}
const timeNow = Date.now() / 1e3
const ONE_DAY = 24 * 3600
const ONE_WEEK = 7 * ONE_DAY

run()

function writeToCache() {
  fs.writeFileSync(cacheFile, JSON.stringify(geckoCache))
}

async function updatePriceData() {
  let allData = sliceIntoChunks(geckoCache.tokens.map(i => i.id), 50)
  let index = 0
  for (const idSet of allData) {
    try {

      ++index
      const ids = idSet
        .filter(i => !geckoCache.prices[i])
      if (!ids.length) continue;
      const url = api.prices(ids.join(','))
      const res = (await axios.get(url)).data
      Object.entries(res).forEach(([key, value]) => geckoCache.prices[key] = value)
      writeToCache()
      console.log('fetched ', index, 'out of', allData.length)
      await sleep(10000)
    } catch (e) {
      console.log('failed ', index, 'out of', allData.length)
      await sleep(10000)
    }
  }
}

async function run() {
  if (!geckoCache.tokens) geckoCache.tokens = (await axios.get(api.tokens)).data
  if (!geckoCache.prices) geckoCache.prices = {}
  // await updatePriceData()

  const prices = Object.values(geckoCache.prices)
  console.log('Coins (Total)', prices.length)
  console.log('Coins (mcap > 1M)', prices.filter(i => i.usd_market_cap > 1e6).length)
  console.log('Coins (mcap > 10M)', prices.filter(i => i.usd_market_cap > 1e7).length)
  console.log('Coins (24h vol > 1M)', prices.filter(i => i.usd_24h_vol > 1e6).length)
  console.log('Coins (24h vol > 10M)', prices.filter(i => i.usd_24h_vol > 1e7).length)
  console.log('Coins (update < 1 day)', prices.filter(i => (timeNow - i.last_updated_at) < ONE_WEEK).length)
  console.log('Coins (update < 1 week)', prices.filter(i => (timeNow - i.last_updated_at) < ONE_DAY).length)


  console.log('Coins (mcap > 1M | 24h vol > 1M | update < 1 week ) ', prices.filter(i => i.usd_market_cap > 1e6).filter(i => i.usd_24h_vol > 1e6).filter(i => (timeNow - i.last_updated_at) < ONE_WEEK).length)
  console.log('Coins (mcap > 10M | 24h vol > 10M | update < 1 day ) ', prices.filter(i => i.usd_market_cap > 1e7).filter(i => i.usd_24h_vol > 1e7).filter(i => (timeNow - i.last_updated_at) < ONE_DAY).length)

  writeToCache()
}
