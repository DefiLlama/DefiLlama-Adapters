const utils = require('./helper/utils');

async function fetch() {

  let pool = '0xb2b7bedd7d7fc19804c7dd4a4e8174c4c73c210d';
  let pool2 = '0x7c2d7b53aca4038f2eb649164181114b9aee93cb';

  let tvl = 0;
  let price_feed = await utils.getPricesfromString('ethereum,bitcoin');
  let tokenBalance = await utils.returnBalance('0xdac17f958d2ee523a2206206994597c13d831ec7', pool);
  let tokenBalanceETH = await utils.returnBalance('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', pool);
  tvl += tokenBalance
  tvl += (tokenBalanceETH * price_feed.data['ethereum'].usd)

  let tokenBalanceBTC = await utils.returnBalance('0x0316EB71485b0Ab14103307bf65a021042c6d380', pool2);
  let tokenBalanceETH2 = await utils.returnBalance('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', pool2);
  tvl += (tokenBalanceBTC * price_feed.data['bitcoin'].usd)
  tvl += (tokenBalanceETH2 * price_feed.data['ethereum'].usd)

  return tvl;

}


module.exports = {
  fetch
}
