const { pool2 } = require("../helper/pool2")
const { usdtAddress} = require("../helper/balances")
const { fetchURL } = require("../helper/utils")
const sdk = require('@defillama/sdk')
const BigNumber = require("bignumber.js");

const VAULTS = {
  STABLECOINS: '0xf1f25A26499B023200B3f9A30a8eCEE87b031Ee1',
  ETH: '0x941ef9AaF3277052e2e6c737ae9a75b229A20988',
  BTC: '0xed18f1CE58fED758C7937cC0b8BE66CB02Dc45c6',
  ALTCOINS: '0x5d735e9ffE9664B80c405D16921912E5B989688C',
}

const BLID = '0x766AFcf83Fd5eaf884B3d529b432CA27A6d84617';
const MASTER_CHEF = '0x3782c47e62b13d579fe748946aef7142b45b2cf7';

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

const totalSupplyBlidABI = {
  'inputs': [],
  'name': 'totalSupplyBLID',
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
  let totalUsdt = new BigNumber(0);
  
  for (const item of Object.values(VAULTS)) {
    const totalDeposit = await sdk.api.abi.call({
      target: item,
      abi: getTotalDepositABI,
      block: chainBlocks.bsc,
      chain: 'bsc'
    });
    
    if (totalDeposit && totalDeposit.output) {
      const usdt = new BigNumber(totalDeposit.output)
        .times(1e-12)
        .toFixed(0);

      totalUsdt = totalUsdt.plus(usdt);
    }
  }
  
  return {
    [usdtAddress]: totalUsdt,
  };
}

async function staking(timestamp, ethBlock, chainBlocks) {
  let totalBLID = new BigNumber(0);

  const balance = await sdk.api.abi.call({
    target: BLID,
    params: MASTER_CHEF,
    abi: 'erc20:balanceOf',
    block: chainBlocks.bsc,
    chain: 'bsc'
  });

  if (balance && balance.output) {
    totalBLID = totalBLID.plus(balance.output);
  }
   
  for (const item of Object.values(VAULTS)) {
    const totalSupplyBLID = await sdk.api.abi.call({
      target: item,
      abi: totalSupplyBlidABI,
      block: chainBlocks.bsc,
      chain: 'bsc'
    });
    
    if (totalSupplyBLID && totalSupplyBLID.output) {
      totalBLID = totalBLID.plus(totalSupplyBLID.output);
    }
  }

  const blidPriceUsd = (await fetchURL('https://bolide.fi/api/v1/price/blid')).data?.rateBLIDtoUSDT;

  const totalUsdt = totalBLID
    .times(blidPriceUsd)
    .times(1e-12)
    .toFixed(0);

  return {
    [usdtAddress]: totalUsdt,
  };
}

module.exports = {
  bsc: {
    tvl,
    staking,
    pool2: pool2('0x3782c47e62b13d579fe748946aef7142b45b2cf7', '0x12c35ed2405bc70721584594723351bf5db6235c', 'bsc'),
  }
}
