const utils = require('./helper/utils');

async function fetch() {
  var data = await utils.fetchURL('https://fapi.ngd.network/api/web/analytics/current');
  let tvl = 0;
  const prices = data.data.pricesData;
  data.data.tokensData.forEach(token=>{
      const price = prices.find(t=>t.symbol === token.priceSymbol)?.price || 0
      tvl += price * Number(token.liquidity)
  })
  return tvl
}

module.exports = {
  fetch
}
