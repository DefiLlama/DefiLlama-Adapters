const utils = require('../helper/utils');
const {fetchChainExports} = require('../helper/exports');

function chainTvl(chain){
  return async()=>{
    const data = await utils.fetchURL(`https://data.cgo.finance/statistic/tvl/${chain}`)
    return data.data.totalTvl
  }
}

module.exports = fetchChainExports(chainTvl, [
  'cronos'
])
