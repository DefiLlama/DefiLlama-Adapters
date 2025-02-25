const { get } = require('./http')
const endpoint = "https://sushi-analytics.llama.fi"

let data 
async function getData() {
  if (!data) data = get(endpoint)
  return data
}

function getTvl(protocol, chain) {
  return async (timestamp) => {
    if (typeof timestamp === "object" && timestamp.timestamp) timestamp = timestamp.timestamp
    if (Math.abs(Date.now() / 1000 - timestamp) > 3600) {
      throw new Error("Can't refill adapters moved to heroku")
    }
    const data = await getData()
    if (data[protocol]?.[chain] === undefined) {
      throw new Error(`Data for protocol ${protocol} on chain ${chain} is undefined on heroku`)
    }
    return data[protocol][chain]
  }
}

function getExports(protocol, chains, exportKeys = []) {
  const chainTvls = chains.reduce((obj, chain) => {
    obj[chain] = {
      tvl: getTvl(protocol, chain)
    }
    exportKeys.forEach(key => {
      obj[chain][key] = getTvl(`${protocol}-${key}`, chain)
    })
    return obj
  }, {})

  return chainTvls
}

module.exports = {
  getExports
}

