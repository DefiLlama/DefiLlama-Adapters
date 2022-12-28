const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const BUSD_TOKEN_CONTRACT = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
const DERIFY_CONTRACT = '0x75777494496f6250DdB9A1B96a6203e219d3698f';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformBscAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'bsc',
    target: BUSD_TOKEN_CONTRACT,
    params: [DERIFY_CONTRACT],
    block: chainBlocks['bsc'],
  })).output;

  sdk.util.sumSingleBalance(balances, transform(BUSD_TOKEN_CONTRACT), collateralBalance)

  return balances;
}

module.exports = {
  bsc: {
    tvl,
  }
}; // node test.js projects/derify/index.js