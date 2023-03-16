const { staking } = require("../helper/staking")
const { pool2 } = require("../helper/pool2")
const { usdtAddress} = require("../helper/balances")
const sdk = require('@defillama/sdk')
const BigNumber = require("bignumber.js");

const VAULTS = {
  STABLECOINS: '0xf1f25A26499B023200B3f9A30a8eCEE87b031Ee1',
  ETH: '0x941ef9AaF3277052e2e6c737ae9a75b229A20988',
  BTC: '0xed18f1CE58fED758C7937cC0b8BE66CB02Dc45c6',
  ALTCOINS: '0x5d735e9ffE9664B80c405D16921912E5B989688C',
}

const getTotalDepositABI = 'uint256:getTotalDeposit'

async function tvl(ts, _block, chainBlocks) {
  let totalUsdt = new BigNumber(0);
  
  
  for (const item of Object.values(VAULTS)) {
    const result = await sdk.api.abi.call({
      target: item,
      abi: getTotalDepositABI,
      block: chainBlocks.bsc,
      chain: 'bsc'
    });
    
    if (result && result.output) {
      const usdt = new BigNumber(result.output)
        .times(1e-12)
        .toFixed(0);

      totalUsdt = totalUsdt.plus(usdt);
    }
  }
  
  return {
    [usdtAddress]: totalUsdt,
  };
}

module.exports = {
  bsc: {
    tvl,
    staking: staking('0x3782c47e62b13d579fe748946aef7142b45b2cf7', '0x766AFcf83Fd5eaf884B3d529b432CA27A6d84617', 'bsc'),
    pool2: pool2('0x3782c47e62b13d579fe748946aef7142b45b2cf7', '0x12c35ed2405bc70721584594723351bf5db6235c', 'bsc'),
  }
}
