const utils = require('./helper/utils');
const {fetchChainExports} = require('./helper/exports');


function chainTvl(chain){
  const hallmarks = []
  return async()=>{
    let data = await utils.fetchURL(`https://api.badger.finance/v2/value?chain=${chain==="ethereum"?"eth":chain}`)
    return data.data.totalValue
  }
}

module.exports = fetchChainExports(chainTvl, ["ethereum", "bsc", "arbitrum"]),
module.exports.hallmarks =  [[1638403200, "Front-end attack"]
]
