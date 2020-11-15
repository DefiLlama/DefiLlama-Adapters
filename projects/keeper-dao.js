const utils = require('./helper/utils');

let coins = [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', //weth
    '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d', //renbtc
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', //usdc
    '0x6b175474e89094c44da98b954eedeac495271d0f', //dai
]

let keys = [
  {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'stable',
    '0x6b175474e89094c44da98b954eedeac495271d0f': 'stable',

    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'ethereum',
    '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d': 'bitcoin'

  }
]


async function fetch() {

  var price_feed = await utils.getPrices(keys);
  var balanceCheck = '0x53463cd0b074E5FDafc55DcE7B1C82ADF1a43B2E';
  var tvl = 0;
  await Promise.all(
    coins.map(async (coin) => {
      let tokenBalance = await utils.returnBalance(coin, balanceCheck);
      if (keys[0][coin] !== 'stable') {
        tvl += tokenBalance * price_feed.data[keys[0][coin]].usd;
      } else {
        tvl += tokenBalance
      }

    })
  )
  let ethBalance = await utils.returnEthBalance(balanceCheck)
  tvl += (ethBalance * price_feed.data['ethereum'].usd)

  return tvl;
}




module.exports = {
  fetch
}
