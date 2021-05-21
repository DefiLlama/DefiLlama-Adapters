const utils = require('./helper/utils');
const {calculateUniTvl} = require('./helper/calculateUniTvl.js')

async function fetch() {
  let response = await utils.fetchURL('https://api.pancakeswap.finance/api/v1/stat')
  return response.data.total_value_locked_all;
}

const factory = '0xBCfCcbde45cE874adCB698cC183deBcF17952812'
const cakeToken = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'
const masterChef = '0x73feaa1eE314F8c655E354234017bE2193C9E24E'
async function tvl(timestamp, ethBlock, chainBlocks){
  const stakedCake = sdk.api.erc20.balanceOf({
    target: cakeToken,
    owner: masterChef,
    chain: 'bsc'
  })
  const balances= await calculateUniTvl(addr=>{
    return `bsc:${addr}`
  }, undefined, 'bsc', factory, 586899, true);
  
  sdk.util.sumSingleBalance(balances, 'bsc:'+cakeToken, (await stakedCake).output)
  return balances
}

module.exports = {
  tvl
}
