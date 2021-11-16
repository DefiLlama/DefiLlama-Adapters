const sdk = require('@defillama/sdk');
const {staking} = require('../helper/staking')
const {pool2} = require('../helper/pool2')

const cdsAddress = '0x3c48Ca59bf2699E51d4974d4B6D284AE52076e5e';
const lpWethCds = '0x0be902716176d66364f1c2ecf25829a6d95c5bee';
const stakingAddress = '0x0a6bfa6aaaef29cbb6c9e25961cc01849b5c97eb';

async function tvl(timestamp, block) {
  let balances = {};

  const results = await sdk.api.abi.multiCall({
    block,
    abi: 'erc20:balanceOf',
    calls: [
      {
        target: cdsAddress,
        params: [lpWethCds]
      },
      {
        target: cdsAddress,
        params: [stakingAddress]
      }
    ]
  })
  sdk.util.sumMultiBalanceOf(balances, results);

  return balances
}

module.exports = {
  staking:{
    tvl: staking(stakingAddress, cdsAddress)
  },
  pool2:{
    tvl: pool2(stakingAddress, lpWethCds)
  },
  tvl: async ()=>({})
}