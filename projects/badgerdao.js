const utils = require('./helper/utils');
const { fetchChainExports } = require('./helper/exports');
const sdk = require('@defillama/sdk')


function chainTvl(chain) {
  if (chain === 'bsc')
    chain = 'binance-smart-chain'
  // chain = chain === "ethereum" ? "eth" : chain
  return async () => {
    let data = await utils.fetchURL(`https://api.badger.com/v2/vaults?chain=${chain}&currency=usd`)
    return data.data.filter(i => {
      if (i.value > 1e9) { 
        sdk.log('error', i)
        return false
      }
      return true
    }).reduce((acc, i) => acc + i.value, 0)
  }
}

module.exports = fetchChainExports(chainTvl, ["ethereum", "bsc", "arbitrum","polygon", "fantom"]),
  module.exports.hallmarks = [[1638403200, "Front-end attack"]
  ]
