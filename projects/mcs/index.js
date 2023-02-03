const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const MCS_TOKEN_CONTRACT = '0xe57Ba6F348AcBf8aC2926B9D22E3060AF82f753f';

async function tvl(timestamp, block ,chainBlocks) {
  const balances = {};
  
  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:totalSupply',
    target: MCS_TOKEN_CONTRACT,
    chain: "kava",
    block: chainBlocks['Kava']
  })).output;
  sdk.util.sumSingleBalance(balances,MCS_TOKEN_CONTRACT , collateralBalance)
  console.log("totalSupply: ", balances);
  return balances;
}

module.exports = {
    kava: {
    tvl,
  }
}; // node test.js projects/mint-club/index.js

  