const {staking} = require('../helper/staking')
const {pool2} = require('../helper/pool2')

const cdsAddress = '0x3c48Ca59bf2699E51d4974d4B6D284AE52076e5e';
const lpWethCds = '0x0be902716176d66364f1c2ecf25829a6d95c5bee';
const stakingAddress = '0x0a6bfa6aaaef29cbb6c9e25961cc01849b5c97eb';

module.exports = {
    methodology: "TVL includes all farms in staking and swap contract",
  ethereum:{
    tvl: async ()=>({}),
    staking: staking(stakingAddress, cdsAddress),
    pool2: pool2(stakingAddress, lpWethCds)
  }
}
