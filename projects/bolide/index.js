const { toUSDTBalances } = require("../helper/balances")
const sdk = require('@defillama/sdk')

const getTotalDepositABI = {
  'inputs': [],
  'name': 'getTotalDeposit',
  'outputs': [
    {
      'internalType': 'uint256',
      'name': '',
      'type': 'uint256'
    }
  ],
  'stateMutability': 'view',
  'type': 'function'
}

async function tvl(ts, _block, chainBlocks) {
  const value = (await sdk.api.abi.call({
    target: '0xf1f25A26499B023200B3f9A30a8eCEE87b031Ee1', 
    abi: getTotalDepositABI,
    block: chainBlocks.bsc,
    chain: 'bsc'
  })).output

  return toUSDTBalances(value, 1e-12)
}

module.exports = {
  bsc: {
    tvl
  }
}