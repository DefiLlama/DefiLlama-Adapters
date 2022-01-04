const sdk = require('@defillama/sdk')
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const FACTORY = '0x7D2Ce25C28334E40f37b2A068ec8d5a59F11Ea54'
const pinksToken = '0x702b3f41772e321aacCdea91e1FCEF682D21125D'
const masterChef = '0xe981676633dCf0256Aa512f4923A7e8DA180C595'

async function tvl(timestamp, ethBlock, chainBlocks){
  const balances = await calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks['bsc'], 'bsc', FACTORY, 0, true);
  const stakedPinkS = await sdk.api.erc20.balanceOf({
    target: pinksToken,
    owner: masterChef,
    chain: 'bsc',
    block: chainBlocks['bsc']
  })
  //sdk.util.sumSingleBalance(balances, 'bsc:'+pinksToken, stakedPinkS.output)
  return balances
}

module.exports = {
  tvl
}