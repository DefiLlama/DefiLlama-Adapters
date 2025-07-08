const sdk = require('@defillama/sdk');
const abi = require('./abi.json');


const nodeManager = '0x3Cf1Dff7CCE2b7291456Bc2089b4bCB2AB5f311A'
const lvtContract = 'avax:0xff579d6259dEDcc80488c9b89d2820bCb5609160'

async function staking(timestamp, ethBlock, chainBlocks) {
    const totalNodeValue = await sdk.api.abi.call({
      target: nodeManager,
      abi: abi['totalNodeValue'],
      block: chainBlocks.avax,
      chain: 'avax'
    });
    
    
    return{
        [lvtContract]: totalNodeValue.output
    }
}


module.exports = {
  start: '2021-12-19',            // 19/12/2021 @ 00:00am (UTC)
  avax:{
      staking,
      tvl: async()=>({})
  }
}

module.exports.deadFrom = '2022-03-29'