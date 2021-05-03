const utils = require('./helper/utils');



const deversifiStarkAddr = '0x5d22045daceab03b158031ecb7d9d06fad24609b';
const listedTokens = [
  '0xdac17f958d2ee523a2206206994597c13d831ec7',
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
  '0x940a2db1b7008b6c776d4faaca729d6d4a4aa551',
  '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  '0xe41d2489571d322189246dafa5ebde1f4699f498',
  '0xcc80c051057b774cd75067dc48f8987c4eb97a5e',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0x419d0d8bdd9af5e606ae2232ed285aff190e711b',
  '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d',
  '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  '0xba100000625a3754423978a60c9317c58a424e3d',
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  '0xc00e94cb662c3520282e6f5717214004a7f26888',
  '0xec67005c4e498ec7f55e092bd1d35cbc47c91892',
  '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
  '0x514910771af9ca656af840dff83e8264ecf986ca',
  '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d',
  '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  '0xeef9f339514298c6a857efcfc1a762af84438dee',
  '0xa117000000f279d81a1d3cc75430faa017fa5a2e',
  '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b',
  '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
  '0x5a98fcbea516cf06857215779fd812ca3bef1b32'
];

let priceKeys = [
  {

    '0x940a2db1b7008b6c776d4faaca729d6d4a4aa551': 'dusk-network',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'bitcoin',
    '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07': 'omisego',
    '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e': 'yearn-finance',
    '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d': 'kleros',
    '0x419d0d8bdd9af5e606ae2232ed285aff190e711b': 'funfair',
    '0xdac17f958d2ee523a2206206994597c13d831ec7': 'stable',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'stable',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'stable',
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': 'maker',
    '0xe41d2489571d322189246dafa5ebde1f4699f498': '0x',
    '0xcc80c051057b774cd75067dc48f8987c4eb97a5e': 'nectar-token',
    '0xba100000625a3754423978a60c9317c58a424e3d': 'balancer',
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'uniswap',
    '0xc00e94cb662c3520282e6f5717214004a7f26888': 'compound-governance-token',
    '0xec67005c4e498ec7f55e092bd1d35cbc47c91892': 'melon',
    '0x0d8775f648430679a709e98d2b0cb6250d2887ef': 'basic-attention-token',
    '0x514910771af9ca656af840dff83e8264ecf986ca': 'chainlink',
    '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': 'havven',
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'aave',
    '0xeef9f339514298c6a857efcfc1a762af84438dee': 'hermez-network-token',
    '0xa117000000f279d81a1d3cc75430faa017fa5a2e': 'aragon',
    '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b': 'defipulse-index',
    '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9': 'compound-usdt',
    '0x5a98fcbea516cf06857215779fd812ca3bef1b32': 'lido-dao',
    '0x0': 'ethereum'
  }
]




async function fetch() {

  var prices = await utils.getPrices(priceKeys);

  var tvl = 0;
  await Promise.all(
    listedTokens.map(async token => {
      var balance = await utils.returnBalance(token, deversifiStarkAddr);
      var key = priceKeys[0][token]
      if (key !== 'stable') {
        tvl += balance * prices.data[key].usd;
      //  console.log(key, balance * prices.data[key].usd);
      } else {
        tvl += balance;
      }
    })
  )
  const ethBalance = await utils.returnEthBalance(deversifiStarkAddr);
  tvl += ethBalance * prices.data['ethereum'].usd;
  return tvl;
}




module.exports = {
  fetch
}
