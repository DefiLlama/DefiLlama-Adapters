const axios = require('axios')
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const START_BLOCK = 4931780-1;
const FACTORY = '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32';

const PoSMappedTokenList = 'https://api.bridge.matic.network/api/tokens/pos/erc20'
const PlasmaMappedTokenList = 'https://api.bridge.matic.network/api/tokens/plasma/erc20'

async function tvl(_, ethBlock, chainBlocks) {
  const posTokens = await axios.get(PoSMappedTokenList)
  const plasmaTokens = await axios.get(PlasmaMappedTokenList)
  const tokens = posTokens.data.tokens.concat(plasmaTokens.data.tokens).reduce((tokenMap, token)=>{
    tokenMap[token.childToken.toLowerCase()] = token.rootToken.toLowerCase();
    return tokenMap;
  }, {})
  const block = chainBlocks['polygon']
  const chain = 'polygon'
  const getAddress = (addr)=> {
    if(addr === '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'){
      return '0x0000000000000000000000000000000000000000'
    }
    return tokens[addr] ?? `polygon:${addr}`
  }

  return await calculateUniTvl(getAddress, block, chain, FACTORY, START_BLOCK)
};

module.exports = {
  tvl,
};
