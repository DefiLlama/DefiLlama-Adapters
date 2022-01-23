const utils = require('../helper/utils');
const {fetchChainExports} = require('../helper/exports');

function chainTvl(chain){
  return async()=>{
    const response = await utils.fetchURL('https://api.spiral.farm/common/info')
    return response.data.totalTvls[chain]
  }
}

module.exports=fetchChainExports(chainTvl, ['fantom'])
