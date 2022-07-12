const { staking } = require("../helper/staking")
const { pool2 } = require("../helper/pool2")
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
    tvl,
    staking: staking('0x3782c47e62b13d579fe748946aef7142b45b2cf7', '0x766AFcf83Fd5eaf884B3d529b432CA27A6d84617', 'bsc'),
    pool2: pool2('0x3782c47e62b13d579fe748946aef7142b45b2cf7', '0x12c35ed2405bc70721584594723351bf5db6235c', 'bsc'),
  }
}