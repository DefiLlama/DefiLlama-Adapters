const sdk = require('@defillama/sdk');
const CSC_SMART_CONTRACT = '0x80b313Be000c42f1f123C7FBd74654544818Ba7c';

async function tvl(chainBlocks) {
  const balances = {};

  const cscBalance = await sdk.api.eth.getBalance({
    target: CSC_SMART_CONTRACT,
    block: chainBlocks['csc'],
    chain: 'csc'
  });

  sdk.util.sumSingleBalance(balances, CSC_SMART_CONTRACT, cscBalance.output);

  return balances;
}

module.exports = {
  start: 14005585,
  methodology: "We count of smart contract balance in coins",
  csc: {
    tvl,
  }
}; 