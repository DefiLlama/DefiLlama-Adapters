const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const START_BLOCK = 16555738; // grappa deployment block
const grappa = '0xe5fc332620c8ba031d697bd45f377589f633a255';

// Converts a bytes32 into an address or, if there is more data, slices an address out of the first 32 byte word
const toAddress = (data) => `0x${data.slice(64 - 40 + 2, 64 + 2)}`.toLowerCase();

module.exports = async function ethereumTvl(timestamp, block, _1, { api }) {  
  let balances = {};

  if(block >= START_BLOCK) {

    // all registered assets
    const tokens = await getLogs({
      api,
      target: grappa,
      topic: 'AssetRegistered(address,uint8)',
      fromBlock: START_BLOCK,
    }).map(log => toAddress(log.topics[0]))
    
    // all registered engines (will hold assets)
    const owners = (await getLogs({
      target: grappa,
      api,
      topic: 'MarginEngineRegistered(address,uint8)',
      fromBlock: START_BLOCK,
    })).map(log => toAddress(log.topics[0]))
  
    return sumTokens2({ tokens: tokens, owners, api })
  }

  return balances;
}