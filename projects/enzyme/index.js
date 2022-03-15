const axios = require('axios');
const retry = require("async-retry");
const { getBlock } = require('../helper/getBlock')
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs');

let tokens = [
  "0x0d8775f648430679a709e98d2b0cb6250d2887ef", // BAT
  "0x0f5d2fb29fb7d3cfee444a200298f468908cc942", // MANA
  "0x1985365e9f78359a9b6ad760e32412f4a445e862", // REP
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", // UNI
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
  "0x408e41876cccdc0f92210600ef50372656052a38", // REN
  "0x4f3afec4e5a3f2a6a1a411def7d7dfe50ee057bf", // DGX
  "0x514910771af9ca656af840dff83e8264ecf986ca", // LINK
  "0x607f4c5bb672230e8672085532f7e901544a7375", // RLC
  "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
  "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359", // SAI
  "0x960b236a07cf122663c4303350609a66a7b288c0", // ANT
  "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", // MKR
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "0xa117000000f279d81a1d3cc75430faa017fa5a2e", // ANTv2
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
  "0xd26114cd6ee289accf82350c8d8487fedb8a0c07", // OMG
  "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
  "0xdd974d5c2e2928dea5f71b9825b8b646686bd200", // KNC
  "0xe41d2489571d322189246dafa5ebde1f4699f498", // ZRX
  "0xec67005c4e498ec7f55e092bd1d35cbc47c91892", // MLN
  "0xf0ee6b27b759c9893ce4f094b49ad28fd15a23e4", // ENG
];

// node test.js projects/enzyme/historical.js
async function tvl(timestamp, blockEth, chainBlocks) {
  const block = await getBlock(timestamp, 'ethereum', chainBlocks);
  const balances = {};

  // V1
  let vaults = (await retry(
    async (bail) =>
      await axios.get(
        "https://app.enzyme.finance/api/v1/vault-list?network=ethereum"
      )
  )).data.map(v => v.id);

  tokens = tokens.map(token => [token, false]);

  for (let i = 0; i < vaults.length / 50; i++) {
    await sumTokensAndLPsSharedOwners(
      balances, 
      tokens, 
      vaults.slice(25 * i, 25 * (i + 1)), 
      block
    );
    await delay(2000);
  };

  balances['0xa117000000f279d81a1d3cc75430faa017fa5a2e'] = balances['0x960b236a07cf122663c4303350609a66a7b288c0'];
  delete balances['0x960b236a07cf122663c4303350609a66a7b288c0'];

  return balances
};
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
};
module.exports = {
  ethereum: {
    tvl
  }
};