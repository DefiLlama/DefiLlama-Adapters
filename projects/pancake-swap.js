const utils = require('./helper/utils');
const {calculateUniTvl} = require('./helper/calculateUniTvl.js')

async function fetch() {
  let response = await utils.fetchURL('https://api.pancakeswap.finance/api/v1/stat')
  return response.data.total_value_locked_all;
}

async function tvl(timestamp, ethBlock, chainBlocks){
  const a= await calculateUniTvl(addr=>{
    return `bsc:${addr}`
  }, undefined, 'bsc', '0xBCfCcbde45cE874adCB698cC183deBcF17952812', 586899, true);
  console.log(a)
  return a
}

module.exports = {
  tvl
}
