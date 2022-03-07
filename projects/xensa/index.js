const sdk = require("@defillama/sdk");
const _us = require('underscore');
const abi = require('./abi.json');
const { getBlock } = require("../helper/getBlock");

const _xensaCoreAddress = '0xd1242313461dd533279f0cac0dbc06ecdb878a79';

async function tvl(timestamp, _ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, "okexchain", chainBlocks, true)
  const reserves_xensa = (
    await sdk.api.abi.call({
      target: _xensaCoreAddress,
      abi: abi["getReserves"],
      block,
      chain: 'okexchain'
    })
  ).output.filter(addr=>addr!=="0x1111111111111111111111111111111111111111");

  const balance_okt = (
    await sdk.api.eth.getBalance({
      target: _xensaCoreAddress,
      block,
      chain: 'okexchain'
    })
  ).output;


  const balanceOfResults = await sdk.api.abi.multiCall({
    block,
    chain: 'okexchain',
    calls: _us.map(reserves_xensa, (reserve) => ({
      target: reserve,
      params: _xensaCoreAddress,
    })),
    abi: "erc20:balanceOf",
  })

  const balances = {};
  balances['okexchain:0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15'] = balance_okt
  const transform = addr=>`okexchain:${addr}`// await transformAddress()
  sdk.util.sumMultiBalanceOf(balances, balanceOfResults, true, transform)

  return balances;

}

module.exports = {
  methodology: 'Using the same methodology applied to other lending platforms, TVL for Xensa consists deposits made to the protocol and borrowed tokens are not counted.',
  okexchain:{
    tvl,
  },
};
