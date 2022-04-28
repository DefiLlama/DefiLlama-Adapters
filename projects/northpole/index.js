const sdk = require('@defillama/sdk');
const abi = require('./abi.json')

async function tvl(timestamp, ethBlock, chainBlocks) {


  let tvl = (await sdk.api.abi.multiCall({
    block: chainBlocks.avax,
    calls: [{
      target: '0x6dda10d81F374438F024Ef4aCB894f23d3d6894A'
      // params: ['']
    }],
    abi: abi.totalTVL,
    chain: 'avax'
  })).output.map(t => t.output);

  return {
    "0xdac17f958d2ee523a2206206994597c13d831ec7": Number(tvl) / 10 ** 12
  }
}

module.exports = {
  methodology: 'The cumulative market value of each vault collateral is TVL',
  avalanche: {
    tvl,
  },
}