const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const MCS_TOKEN_CONTRACT = '0xDa5aC8F284537d6eaB198801127a9d49b0CbDff5';

async function tvl(timestamp, block ,chainBlocks) {
  const balances = {};
  
  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:totalSupply',
    target: MCS_TOKEN_CONTRACT,
    chain: "kava",
    block: chainBlocks['Kava']
  })).output;
  sdk.util.sumSingleBalance(balances,MCS_TOKEN_CONTRACT , collateralBalance)
  
  return balances;
}

module.exports = {
    kava: {
    tvl,
  }
}; // node test.js projects/mcs/index.js