const sdk = require("@defillama/sdk");
const _us = require('underscore');
const abi = require('./abi.json');
const {transformFantomAddress} = require('../helper/portedTokens')

const _mensaCoreAddress = '0xc4fcDd290E25B4e12Cde6A56F23C1D3ffc72061A';

async function tvl(_, _ethBlock, chainBlocks) {

  const reserves_mensa = (
    await sdk.api.abi.call({
      target: _mensaCoreAddress,
      abi: abi["getReserves"],
      block: chainBlocks['fantom'],
      chain: 'fantom'
    })
  ).output;

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
    if (reserve === '0x1111111111111111111111111111111111111111') return;
    if (reserve === 'fantom:0x049d68029688eAbF473097a2fC38ef61633A3C7A') return;
    if (reserve === 'fantom:fantom:0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E') return;
    if (reserve === 'fantom:fantom:0x76975293D202bdFd2f66E8d405B4457dc7BBD7eB') return;

    let symbol;
    // switch (reserve) {
    //   case "0x76975293D202bdFd2f66E8d405B4457dc7BBD7eB":
    //     symbol = {
    //       output: 'MENSALP'
    //     };
    //     break
    //   default:
    //     symbol = symbolsOfReserve[i]
    // }

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
  fantom:{
    tvl,
  },
  tvl
};