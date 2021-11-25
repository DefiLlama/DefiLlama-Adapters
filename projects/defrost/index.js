const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const _ = require('underscore');
const abi = require('./abi');

const avaxpool = '0x34f2fe77a14afac8a7b7f18ed1e3b2c5a1e0ccbc';
let usd = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

async function avax(timestamp, block) {
    let totalSupply = (await sdk.api.abi.call({
        block,
        target: avaxpool,
        abi: abi['totalSupply'],
        chain:'avax'
    })).output;

  totalSupply = parseFloat(new BigNumber(totalSupply).times(Math.pow(10, 4)));

  let tk= usd;
  return{[tk]:totalSupply};

}


module.exports = {
  start: 6965653,  // beijing time 2021-9-11 0:0:
  avax:{
    tvl: avax
  }
};
