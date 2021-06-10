const utils = require('./helper/utils');
const web3 = require('./config/web3.js');

const retry = require('./helper/retry')
const axios = require("axios");

const BigNumber = require('bignumber.js');
const abis = require('./config/indexed/abis.js');


let keys = [
  {

    '0x514910771af9ca656af840dff83e8264ecf986ca': 'chainlink',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'bitcoin',
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'aave',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'stable',
    '0x0000000000085d4780B73119b644AE5ecd22b376': 'stable',
    '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e': 'yearn-finance', //yfi
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
    '0xd533a949740bb3306d119cc777fa900ba034cd52': 'curve-dao-token',
    '0xc00e94cb662c3520282e6f5717214004a7f26888': 'compound-governance-token',
    '0x04fa0d235c4abf4bcf4787af4cf447de572ef828': 'uma',
    '0xd26114cd6ee289accf82350c8d8487fedb8a0c07': 'omisego',

  }
]

async function fetch() {
  let tvlPool1 = 0;
  let tvlPool2 = 0;

  let pool = '0xfa6de2697d59e88ed7fc4dfe5a33dac43565ea41';
  let pool2 = '0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3';
  let contract = new web3.eth.Contract(abis.abis.main, pool);

  let price_feed = await utils.getPricesfromString('compound-governance-token,curve-dao-token,havven,maker,yearn-finance,aave,uniswap,chainlink,omisego,uma,0x,chainlink');

  let tokens = await contract.methods.getCurrentTokens().call();

  await Promise.all(
    tokens.map(async (token) => {
      let balance = await utils.returnBalance(token, pool);
      if (keys[0][token.toLowerCase()]) {
        tvlPool1 += parseFloat(balance) * price_feed.data[keys[0][token.toLowerCase()]].usd
      } else {
        console.log('Indexed Could not find token', token)
      }
    })
  )

  let contract2 = new web3.eth.Contract(abis.abis.main, pool2);
  let tokens2 = await contract2.methods.getCurrentTokens().call();
  await Promise.all(
    tokens2.map(async (token) => {
      let balance = await utils.returnBalance(token, pool2);
      if (keys[0][token.toLowerCase()]) {
        tvlPool2 += parseFloat(balance) * price_feed.data[keys[0][token.toLowerCase()]].usd
      } else {
        console.log('Indexed Could not find token', token)
      }
    })
  )


  let tvl = tvlPool1 + tvlPool2
  //
  // let pool
  // let tvl = 0;
  // let price_feed = await utils.getPricesfromString('ethereum,bitcoin');
  // let tokenBalance = await utils.returnBalance('0xdac17f958d2ee523a2206206994597c13d831ec7', pool);

  return tvl;

}

module.exports = {
  fetch
}
