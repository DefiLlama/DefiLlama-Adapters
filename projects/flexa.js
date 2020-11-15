const utils = require('./helper/utils');

async function fetch() {

  let pool = '0x706D7F8B3445D8Dfc790C524E3990ef014e7C578';
  let tokenBalance = await utils.returnBalance('0xff20817765cb7f73d4bde2e66e067e58d11095c2', pool);
  let price_feed = await utils.getPricesfromString('amp-token');
  var tvl = (price_feed.data['amp-token'].usd * tokenBalance)
  return tvl;

}


module.exports = {
  fetch
}
