const utils = require('../helper/utils');
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const factory = '0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3'
async function tvl(_timestamp, _ethBlock, chainBlocks){
  const multichainTokens = (await utils.fetchURL('https://netapi.anyswap.net/bridge/v2/info')).data.bridgeList

  const balances = await calculateUniTvl(addr=>{
    // WFTM
    if(addr.toLowerCase() === "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"){
      return "0x4e15361fd6b4bb609fa63c81a2be19d873717870"
    }
    const srcToken = multichainTokens.find(token=>token.chainId === "250" && token.token === addr.toLowerCase())
    if(srcToken !== undefined){
      if(srcToken.srcChainId === '1'){
        return srcToken.srcToken;
      } else if(srcToken.srcChainId === '56'){
        return `bsc:${srcToken.srcToken}`;
      }
    }
    return `fantom:${addr}`
  }, chainBlocks['fantom'], 'fantom', factory, 3795376, true);
  return balances
}

module.exports = {
  fantom:{
    tvl,
  },
  tvl
}