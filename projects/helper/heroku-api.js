const { readFromElastic } = require('./custom-scripts/sushi-analytics-v2/cache')

function getTvl(project, tvlKey) {
  return async (timestamp) => {
    if (typeof timestamp === "object" && timestamp.timestamp) timestamp = timestamp.timestamp
    const response = await readFromElastic({
      tvlKey, 
      timestamp: timestamp*1000,
      project
    })
    return response.balances
  }
}

function getExports(protocol, chains, exportKeys = []) {
  if (!exportKeys.includes('tvl')) exportKeys.push('tvl')
  const chainTvls = chains.reduce((obj, chain) => {
    obj[chain] = {}
    exportKeys.forEach(key => {
      obj[chain][key] = getTvl(protocol, `${chain}-${key}`)
    })
    return obj
  }, {})

  return chainTvls
}

module.exports = {
  getExports
}

