const utils = require('./helper/utils');
const { fetchChainExports } = require('./helper/exports');


function chainTvl(chain) {
  if (chain === 'bsc')
    chain = 'binance-smart-chain'
  // chain = chain === "ethereum" ? "eth" : chain
  return async () => {
    let data = await utils.fetchURL(`https://api.badger.com/v2/vaults?chain=${chain}&currency=usd`)
    return data.data.reduce((acc, i) => acc + i.value, 0)
  }
}

module.exports = fetchChainExports(chainTvl, ["ethereum", "bsc", "arbitrum","polygon", "fantom"]),
  module.exports.hallmarks = [[1638403200, "Front-end attack"]
  ]
