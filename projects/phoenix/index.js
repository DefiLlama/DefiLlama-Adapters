const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const _ = require('underscore');
const abi = require('./abi');

const ploypool = '0x7751ff8c091b60cd51219ea244f9760d21fda041';
const bscpool = '0xBB8dA4ed33388A0eAc442eD1f28474413FC9d7a7';
const wanpool = '0xBB8dA4ed33388A0eAc442eD1f28474413FC9d7a7';

async function polygon(timestamp, block) {
  let totalSupply = (await sdk.api.abi.call({
    block,
    target: ploypool,
    abi: abi['totalSupply'],
    chain:'polygon'
  })).output;

  totalSupply = parseFloat(new BigNumber(totalSupply).div(Math.pow(10, 2)));
  return totalSupply;
}

async function bsc(timestamp, block) {
    let totalSupply = (await sdk.api.abi.call({
        block,
        target: bscpool,
        abi: abi['totalSupply'],
        chain:'bsc'
    })).output;

    totalSupply = parseFloat(new BigNumber(totalSupply).div(Math.pow(10, 2)));
    return totalSupply;
}

async function wan(timestamp, block) {
    let totalSupply = (await sdk.api.abi.call({
        block,
        target: wanpool,
        abi: abi['totalSupply'],
        chain:'wan'
    })).output;

    totalSupply = parseFloat(new BigNumber(totalSupply).div(Math.pow(10, 2)));
    return totalSupply;
}

async function tvl(timestamp, block) {
    let tvl = (await polygon(timestamp, block))
             +(await bsc(timestamp, block))
             +(await wan(timestamp, block));
    //console.log(tvl);
    return tvl;
}

module.exports = {
  start: 1631376000,  // beijing time 2021-9-11 0:0:
  ploygon:{
    tvl: polygon,
  },
  bsc:{
    tvl: bsc
  },
  wan:{
     tvl: wan
  },
  tvl
};
