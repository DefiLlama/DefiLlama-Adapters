const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {


  let price_feed = await utils.getPricesfromString('ethereum,binancecoin');

  let tokens = await utils.fetchURL('https://api.cream.finance/api/v1/crtoken')
  let tvl = 0;
  await Promise.all(
    tokens.data.map(async token => {
      let balance = (token.underlying_price.value * token.exchange_rate.value * token.total_supply.value * price_feed.data.ethereum.usd);

      tvl += balance
    })
  )

  let bscTokens = await utils.fetchURL('https://api.cream.finance/bsc/api/v1/crtoken')
  await Promise.all(
    bscTokens.data.map(async token => {
      let balance = (token.underlying_price.value * token.exchange_rate.value * token.total_supply.value * price_feed.data['binancecoin'].usd);
      tvl += balance
    })
  )

  console.log(tvl);
  return tvl;
}

module.exports = {
  fetch
}
