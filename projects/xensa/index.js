const sdk = require("@defillama/sdk");
const _us = require('underscore');
const abi = require('./abi.json');
const {transformAddress} = require('../helper/portedTokens')

const _xensaCoreAddress = '0xd1242313461dd533279f0cac0dbc06ecdb878a79';

async function tvl(_, _ethBlock, chainBlocks) {

  const reserves_xensa = (
    await sdk.api.abi.call({
      target: _xensaCoreAddress,
      abi: abi["getReserves"],
      block: chainBlocks['okexchain'],
      chain: 'okexchain'
    })
  ).output;

  const decimalsOfReserve = (
    await sdk.api.abi.multiCall({
      calls: _us.map(reserves_xensa, (reserve) => ({
        target: reserve
      })),
      abi: "erc20:decimals",
      block: chainBlocks['okexchain'],
      chain: 'okexchain'
    })
  ).output;

  const assets = [];
  reserves_xensa.map((reserve, i) => {

    let symbol;

    let decimals = decimalsOfReserve[i];
    if (decimals.success) {
      assets.push({
        address: reserve,
      })
    } else {
      throw new Error("Call failed")
    }
  })

  const balance_okt = (
    await sdk.api.eth.getBalance({
      target: _xensaCoreAddress,
      block: chainBlocks['okexchain'],
      chain: 'okexchain'
    })
  ).output;


  const balanceOfResults = await sdk.api.abi.multiCall({
    block: chainBlocks['okexchain'],
    chain: 'okexchain',
    calls: _us.map(assets, (reserve) => ({
      target: reserve.address,
      params: _xensaCoreAddress,
    })),
    abi: "erc20:balanceOf",
  })

  const balances = {};
  const transform = await transformAddress()

  assets.forEach((_item,_i)=>{
    balances[transform(_item.address)] = balanceOfResults.output[_i].output;
  })

  balances['okexchain:0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15'] = balance_okt

  return balances;

}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Using the same methodology applied to other lending platforms, TVL for Xensa consists deposits made to the protocol and borrowed tokens are not counted.',
  okexchain:{
    tvl,
  },
  tvl
};
