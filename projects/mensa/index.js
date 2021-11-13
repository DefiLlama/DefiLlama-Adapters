const sdk = require("@defillama/sdk");
const _us = require('underscore');
const abi = require('./abi.json');
const {transformFantomAddress} = require('../helper/portedTokens')

const _mensaCoreAddress = '0xa7D5d34207eb2EfB510Fb15b06feE6224Cd936Cd';

async function tvl(_, _ethBlock, chainBlocks) {

  const reserves_mensa = (
    await sdk.api.abi.call({
      target: _mensaCoreAddress,
      abi: abi["getReserves"],
      block: chainBlocks['fantom'],
      chain: 'fantom'
    })
  ).output.filter(t=>t!=="0x1111111111111111111111111111111111111111");

  const decimalsOfReserve = (
    await sdk.api.abi.multiCall({
      calls: _us.map(reserves_mensa, (reserve) => ({
        target: reserve
      })),
      abi: "erc20:decimals",
      block: chainBlocks['fantom'],
      chain: 'fantom'
    })
  ).output;

  const assets = [];
  reserves_mensa.map((reserve, i) => {

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

  const balance_ftm = (
    await sdk.api.eth.getBalance({
      target: _mensaCoreAddress,
      block: chainBlocks['fantom'],
      chain: 'fantom'
    })
  ).output;


  const balanceOfResults = await sdk.api.abi.multiCall({
    block: chainBlocks['fantom'],
    chain: 'fantom',
    calls: _us.map(assets, (reserve) => ({
      target: reserve.address,
      params: _mensaCoreAddress,
    })),
    abi: "erc20:balanceOf",
  })

  const balances = {};
  const transform = await transformFantomAddress()

  assets.forEach((_item,_i)=>{
    balances[transform(_item.address)] = balanceOfResults.output[_i].output;
  })

  balances['fantom:0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'] = balance_ftm

  return balances;

}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Using the same methodology applied to other lending platforms, TVL for Mensa consists deposits made to the protocol and borrowed tokens are not counted.',
  fantom:{
    tvl,
  },
  tvl
};
