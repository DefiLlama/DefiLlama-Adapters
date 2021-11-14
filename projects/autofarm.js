const utils = require('./helper/utils');
const {fetchChainExports} = require('./helper/exports');

const transformChain = {
  okexchain: 'okex',
  avalanche: 'avax',
}

function chainTvl(chain){
  return async()=>{
    const data = await utils.fetchURL(`https://static.autofarm.network/${transformChain[chain] ?? chain}/stats.json`)
  return data.data.platformTVL
  }
}

module.exports=fetchChainExports(chainTvl, [
  'bsc',       'polygon',
  'heco',      'avalanche',
  'fantom',    'moonriver',
  'okexchain', 'celo',
  'cronos',
])