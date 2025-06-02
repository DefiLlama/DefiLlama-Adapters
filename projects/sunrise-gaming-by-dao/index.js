const {staking} = require('../helper/staking')
const {pool2} = require('../helper/pool2')

const suncAddress = '0x692aCCdD8b86692427E0aa4752AE917Df01CC56F';
const lpWethSunc = '0xaf5a7469cf2571b973aeee9ae2f8aad00e1337d2';
const stakingAddress = '0x7dbE40ac6bB41A5FE4Fa2C74f31d7DEFBC793B58';

module.exports = {
  ethereum:{
    staking: staking(stakingAddress, suncAddress),
    pool2: pool2(stakingAddress, lpWethSunc),
    tvl: async ()=>({})
  }
}