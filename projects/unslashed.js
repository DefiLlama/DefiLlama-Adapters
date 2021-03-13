const utils = require('./helper/utils');

async function fetch() {

  let tvl = 0;
  let price_feed = await utils.getPricesfromString('ethereum');

  let stake = '0x3b6c03b232f87aee2ea6561ec7bf080a7710d667';
  let ethBalance = await utils.returnEthBalance(stake);
  tvl += (ethBalance * price_feed.data.ethereum.usd);
  return tvl;

}


module.exports = {
  fetch
}
