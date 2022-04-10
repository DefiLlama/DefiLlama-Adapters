const sdk = require('@defillama/sdk');
const WETH_CONTRACT = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

async function tvl(timestamp, block) {
  const balances = {};

  const balance = (await sdk.api.eth.getBalance({
      target: WETH_CONTRACT,
      block: block
  })).output

  await sdk.util.sumSingleBalance(balances, WETH_CONTRACT, balance)

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Tracks the ETH balance of the wETH9 contract.',
  start: 14549361 ,
  ethereum: {
    tvl,
  }
}; 