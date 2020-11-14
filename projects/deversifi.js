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
  '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d'
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
    '0xcc80c051057b774cd75067dc48f8987c4eb97a5e': 'nectar-token'
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
      } else {
        tvl += balance;
      }
    })
  )
  return tvl;
}




module.exports = {
  fetch
}
