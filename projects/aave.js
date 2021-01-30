var Web3 = require('web3');
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));

const BigNumber = require("bignumber.js");
const retry = require('async-retry')
const axios = require("axios");
const abis = require('./config/abis.js')
const utils = require('./helper/utils');


let coins = [
  {

    '0x514910771af9ca656af840dff83e8264ecf986ca': '18',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': '8',
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': '18',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '6',
    '0x0000000000085d4780B73119b644AE5ecd22b376': '18',
    '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e': '18', //yfi
    '0x408e41876cccdc0f92210600ef50372656052a38': '18', //renbtc
    '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03': '18', //lend
    '0x4fabb145d64652a948d72533023f6e7a623c7c53': '18', //busd
    '0xdac17f958d2ee523a2206206994597c13d831ec7': '6', //USDT
    '0x6b175474e89094c44da98b954eedeac495271d0f': '18', //DAI
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': '18', //makerdao
    '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': '18', //SNX
    '0x0f5d2fb29fb7d3cfee444a200298f468908cc942': '18', //MANA
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': '18', //uni
    '0xdd974d5c2e2928dea5f71b9825b8b646686bd200': '18', //knc
    '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c': '18', //ENJ
    '0x0d8775f648430679a709e98d2b0cb6250d2887ef': '18', //BAT
    '0x57ab1ec28d129707052df4df418d58a2d46d5f51': '18', //susd
    '0xe41d2489571d322189246dafa5ebde1f4699f498': '18', //0x

  }
]

let keys = [
  {

    '0x514910771af9ca656af840dff83e8264ecf986ca': 'chainlink',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'bitcoin',
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'aave',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'stable',
    '0x0000000000085d4780B73119b644AE5ecd22b376': 'stable',
    '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e': 'yearn-finance', //yfi 
    '0x408e41876cccdc0f92210600ef50372656052a38': 'republic-protocol', //ren
    '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03': 'ethlend', //lend
    '0x4fabb145d64652a948d72533023f6e7a623c7c53': 'stable', //busd
    '0xdac17f958d2ee523a2206206994597c13d831ec7': 'stable', //USDT
    '0x6b175474e89094c44da98b954eedeac495271d0f': 'stable', //DAI
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': 'maker', //makerdao
    '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': 'havven', //SNX
    '0x0f5d2fb29fb7d3cfee444a200298f468908cc942': 'decentraland', //MANA
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'uniswap', //uni
    '0xdd974d5c2e2928dea5f71b9825b8b646686bd200': 'kyber-network', //knc
    '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c': 'enjincoin', //ENJ
    '0x0d8775f648430679a709e98d2b0cb6250d2887ef': 'basic-attention-token', //BAT
    '0x57ab1ec28d129707052df4df418d58a2d46d5f51': 'stable', //susd
    '0xe41d2489571d322189246dafa5ebde1f4699f498': '0x', //0x

  }
]




async function fetch() {

  var price_feed = await utils.getPrices(keys);

  var balanceCheck = '0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3';
  var tvl = 0;
  for (var key in coins[0]) {
    var dacontract = new web3.eth.Contract(abis.abis.minABI, key)
    var balances = await dacontract.methods.balanceOf(balanceCheck).call();
    balances = await new BigNumber(balances).div(10 ** coins[0][key]).toFixed(2);
    if (keys[0][key] != 'stable') {
      tvl += (parseFloat(balances) * price_feed.data[keys[0][key]].usd)
    } else {
      tvl += parseFloat(balances)
    }
  }

  var stakeContract = '0x4da27a545c0c5b758a6ba100e3a049001de870f5';
  var dacontract = new web3.eth.Contract(abis.abis.minABI, '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9')
  var balances = await dacontract.methods.balanceOf(balanceCheck).call();
  balances = await new BigNumber(balances).div(10 ** 18).toFixed(2);
  tvl += parseFloat(balances * price_feed.data['aave'].usd)
  return tvl;
}




module.exports = {
  fetch
}
