const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const START_BLOCK = 16555738; // grappa deployment block
const grappa = '0xe5fc332620c8ba031d697bd45f377589f633a255';

module.exports = async function ethereumTvl(timestamp, block, _1, { api }) {  
  let balances = {};

  if(block >= START_BLOCK) {
    // get all tokens
    const numTokens = await api.call({  abi: 'function lastAssetId() view returns (uint8)' , target: grappa }) 
    const tokens = []
    for (let id = 1; id <= numTokens; id++) {
      tokens.push(await api.call({  abi: 'function assets(uint8) view returns (address)' , target: grappa, params: [id] }))
    }
    // get all owners
    const numEngines = await api.call({  abi: 'function lastEngineId() view returns (uint8)' , target: grappa })
    const owners = []
    for (let id = 1; id <= numEngines; id++) {
      owners.push(await api.call({  abi: 'function engines(uint8) view returns (address)' , target: grappa, params: [id] }))
    }
  
    return sumTokens2({ tokens: tokens, owners, api })
  }

  return balances;
}