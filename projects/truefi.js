const utils = require('./helper/utils');

async function fetch() {

  let tvl = 0;
  let price_feed = await utils.getPricesfromString('truefi');

  let stake = '0x43A4F930F2cC35948d3a6dcd47CD0E50761f9B88';
  let tokenBalance = await utils.returnBalance('0x4c19596f5aaff459fa38b0f7ed92f11ae6543784', stake);
  tvl += (tokenBalance * price_feed.data.truefi.usd);

  let pool = '0xa1e72267084192db7387c8cc1328fade470e4149';
  tokenBalance = await utils.returnBalance('0x0000000000085d4780B73119b644AE5ecd22b376', pool);
  tvl += tokenBalance
  return tvl;

}


module.exports = {
  fetch
}
