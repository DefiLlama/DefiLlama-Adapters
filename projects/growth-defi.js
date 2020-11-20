const utils = require('./helper/utils');

async function fetch() {

  let price_feed = await utils.getPricesfromString('cdai,compound-usd-coin');


  let pool = '0x3c918ab39c4680d3ebb3eafca91c3494f372a20d';
  let tokenBalance = await utils.returnBalance('0x39aa39c021dfbae8fac545936693ac917d5e7563', pool);
  var tvl = (price_feed.data['compound-usd-coin'].usd * tokenBalance)

  let pool2 = '0x8c659d745eb24df270a952f68f4b1d6817c3795c';
  let tokenBalance2 = await utils.returnBalance('0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', pool2);
  tvl += (price_feed.data['cdai'].usd * tokenBalance)

  return tvl;

}


module.exports = {
  fetch
}
